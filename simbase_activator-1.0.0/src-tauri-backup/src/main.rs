// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct SimDetails {
    iccid: String,
    name: String,
    state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    msisdn: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    imei: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateNameRequest {
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChangeStateRequest {
    state: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiError {
    message: String,
}

// Commande pour récupérer les détails d'une SIM
#[tauri::command]
async fn get_sim_details(api_key: String, iccid: String) -> Result<SimDetails, String> {
    println!("🔍 GET SIM Details: {}", iccid);
    
    let client = reqwest::Client::new();
    let url = format!("https://api.simbase.com/v2/simcards/{}", iccid);
    
    println!("📡 URL: {}", url);
    
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| {
            let error_msg = format!("Erreur réseau: {}", e);
            println!("❌ {}", error_msg);
            error_msg
        })?;
    
    println!("✅ Status: {}", response.status());
    
    if response.status().is_success() {
        response
            .json::<SimDetails>()
            .await
            .map_err(|e| format!("Erreur parsing: {}", e))
    } else {
        let error: ApiError = response
            .json()
            .await
            .unwrap_or(ApiError {
                message: "Erreur API inconnue".to_string(),
            });
        Err(error.message)
    }
}

// Commande pour activer une SIM
#[tauri::command]
async fn activate_sim(api_key: String, iccid: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.simbase.com/v2/simcards/{}/state", iccid);
    
    let body = ChangeStateRequest {
        state: "enabled".to_string(),
    };
    
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erreur réseau: {}", e))?;
    
    if response.status().is_success() {
        Ok("SIM activée avec succès".to_string())
    } else {
        let error: ApiError = response
            .json()
            .await
            .unwrap_or(ApiError {
                message: "Erreur lors de l'activation".to_string(),
            });
        Err(error.message)
    }
}

// Commande pour mettre à jour le nom d'une SIM
#[tauri::command]
async fn update_sim_name(api_key: String, iccid: String, name: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.simbase.com/v2/simcards/{}", iccid);
    
    let body = UpdateNameRequest { name };
    
    let response = client
        .patch(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erreur réseau: {}", e))?;
    
    if response.status().is_success() {
        Ok("Nom mis à jour avec succès".to_string())
    } else {
        let error: ApiError = response
            .json()
            .await
            .unwrap_or(ApiError {
                message: "Erreur lors de la mise à jour".to_string(),
            });
        Err(error.message)
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_sim_details,
            activate_sim,
            update_sim_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
