package co.edu.jacquin.jam_app.data.remote

import co.edu.jacquin.jam_app.core.ApiConfig
import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * FIX robusto para respuestas PHP "sucias":
 * - BOM / espacios antes del JSON
 * - JSON doble-encodado (ej: ""{...}"")  -> Expected BEGIN_OBJECT but was STRING
 *
 * Esto NO reemplaza arreglar el backend, pero evita que la app se rompa.
 */
object RetrofitClient {

    private val gson = GsonBuilder()
        .setLenient()
        .create()

    private class JsonSanitizingInterceptor : Interceptor {
        override fun intercept(chain: Interceptor.Chain): Response {
            val original = chain.proceed(chain.request())
            val body = original.body ?: return original

            val contentType = body.contentType()
            val raw = body.string()

            val cleaned = raw
                .removePrefix("\uFEFF")
                .trimStart()

            val normalized = unwrapJsonStringIfNeeded(cleaned)

            val newBody = normalized.toResponseBody(contentType)
            return original.newBuilder().body(newBody).build()
        }

        /**
         * Caso común en PHP cuando se hace json_encode() de un string que YA era JSON:
         * devuelve algo como: "{\"success\":true,\"message\":\"...\"}"
         */
        private fun unwrapJsonStringIfNeeded(text: String): String {
            val t = text.trimStart()

            // Si parece HTML, no tocamos
            if (t.startsWith("<!DOCTYPE", ignoreCase = true) || t.startsWith("<html", ignoreCase = true)) {
                return text
            }

            // Si viene entre comillas, intentamos des-escapar
            if (t.length >= 2 && t.first() == '"' && t.last() == '"') {
                val inner = t.substring(1, t.length - 1)

                // Des-escape básico: primero \ -> \, luego " -> ", luego 
 
 	
                val unescaped = inner
                    .replace("\\\\", "\\")   // \\ -> \
                    .replace("\\\"", "\"")       // \\\" -> "
                    .replace("\\n", "\n")
                    .replace("\\r", "\r")
                    .replace("\\t", "\t")

                // Si ahora empieza con { o [, devolvemos el JSON real
                val candidate = unescaped.trimStart()
                if (candidate.startsWith("{") || candidate.startsWith("[")) {
                    return candidate
                }
            }

            return text
        }
    }

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(JsonSanitizingInterceptor())
        .connectTimeout(25, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .writeTimeout(25, TimeUnit.SECONDS)
        .build()

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL) // IMPORTANTE: debe terminar en "/"
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    val api: JamApiService by lazy { retrofit.create(JamApiService::class.java) }
}