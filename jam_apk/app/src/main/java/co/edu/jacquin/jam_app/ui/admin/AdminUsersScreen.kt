package co.edu.jacquin.jam_app.ui.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import co.edu.jacquin.jam_app.data.remote.dto.UserDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminUsersScreen(
    viewModel: AdminViewModel,
    onBackClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedUser by remember { mutableStateOf<UserDto?>(null) }
    
    // Cargar usuarios al inicio
    LaunchedEffect(Unit) {
        viewModel.loadUsers()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Usuarios", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Volver", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF00346A)
                )
            )
        },
        snackbarHost = {
            // Mostrar errores o éxitos si es necesario, 
            // aunque aquí usaremos el estado directo en la UI
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Buscador
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Buscar usuario...") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            if (uiState.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (uiState.error != null) {
                Text(
                    text = "Error: ${uiState.error}", 
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )
                Button(
                    onClick = { viewModel.loadUsers() },
                    modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 8.dp)
                ) {
                    Text("Reintentar")
                }
            } else {
                // Lista filtrada
                val filteredList = uiState.users.filter { 
                    it.full_name.contains(searchQuery, ignoreCase = true) || 
                    it.email.contains(searchQuery, ignoreCase = true)
                }

                if (filteredList.isEmpty()) {
                    Text("No se encontraron usuarios.", modifier = Modifier.align(Alignment.CenterHorizontally))
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(filteredList) { user ->
                            UserItemCard(
                                user = user,
                                onClick = { selectedUser = user }
                            )
                        }
                    }
                }
            }
        }
    }

    // Modal de Edición
    if (selectedUser != null) {
        EditRoleDialog(
            user = selectedUser!!,
            onDismiss = { selectedUser = null },
            onSave = { newRole ->
                viewModel.updateUserRole(selectedUser!!, newRole)
                selectedUser = null
            }
        )
    }
}

@Composable
fun UserItemCard(user: UserDto, onClick: () -> Unit) {
    val roleName = when(user.id_rol) {
        1 -> "Administrador"
        2 -> "Profesor"
        3 -> "Estudiante"
        else -> "Desconocido (${user.id_rol})"
    }
    
    val roleColor = when(user.id_rol) {
        1 -> Color(0xFFD42626) // Rojo Admin
        2 -> Color(0xFF267AD4) // Azul Profe
        3 -> Color(0xFF26D466) // Verde Estudiante
        else -> Color.Gray
    }

    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Filled.Person, contentDescription = null, modifier = Modifier.size(40.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = user.full_name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(text = user.email, fontSize = 14.sp, color = Color.Gray)
            }
            Surface(
                color = roleColor.copy(alpha = 0.2f),
                shape = MaterialTheme.shapes.small
            ) {
                Text(
                    text = roleName,
                    color = roleColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
            IconButton(onClick = onClick) {
                Icon(Icons.Filled.Edit, contentDescription = "Editar", tint = Color.Gray)
            }
        }
    }
}

@Composable
fun EditRoleDialog(user: UserDto, onDismiss: () -> Unit, onSave: (Int) -> Unit) {
    var selectedRole by remember { mutableStateOf(user.id_rol) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar Rol") },
        text = {
            Column {
                Text("Usuario: ${user.full_name}")
                Spacer(modifier = Modifier.height(16.dp))
                Text("Selecciona el nuevo rol:", fontWeight = FontWeight.Bold)
                
                RoleRadioButton(1, "Administrador", selectedRole) { selectedRole = 1 }
                RoleRadioButton(2, "Profesor", selectedRole) { selectedRole = 2 }
                RoleRadioButton(3, "Estudiante (Usuario)", selectedRole) { selectedRole = 3 }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(selectedRole) }) {
                Text("Guardar Cambios")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun RoleRadioButton(roleId: Int, label: String, currentSelection: Int, onSelect: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable { onSelect() },
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = (roleId == currentSelection),
            onClick = onSelect
        )
        Text(text = label, modifier = Modifier.padding(start = 8.dp))
    }
}
