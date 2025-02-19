#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("Iniciando aplicação Tauri...");
    
    let builder = tauri::Builder::default();
    println!("Builder criado");
    
    let builder = builder.plugin(tauri_plugin_notification::init());
    println!("Plugin de notificação inicializado");
    
    let builder = builder.setup(|app| {
        if cfg!(debug_assertions) {
            println!("Configurando logs em modo debug");
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Debug)
                    .build(),
            )?;
        }
        println!("Setup concluído");
        Ok(())
    });
    
    println!("Executando aplicação...");
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    println!("Aplicação encerrada");
}
