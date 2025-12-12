plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "co.edu.jacquin.jam_app"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "co.edu.jacquin.jam_app"
        minSdk = 21
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    // --- Retrofit + Gson (para consumir tu API PHP) ---
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")

    // --- OkHttp Logging (para ver las peticiones en Logcat) ---
    implementation("com.squareup.okhttp3:logging-interceptor:5.0.0-alpha.14")

    // --- Coroutines (para llamadas asíncronas) ---
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // --- ViewModel (arquitectura por capas) ---
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")

    // --- Navigation Compose (pantallas: splash, login, dashboard...) ---
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // ViewModel integrado con Compose
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Back arrow
    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.compose.animation:animation-graphics")

    // ---- ANIMACIONES TRANSICIONES ENTRE PANTALLAS ----
    implementation("androidx.compose.animation:animation")




}