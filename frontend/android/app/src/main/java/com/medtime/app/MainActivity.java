package com.medtime.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import android.util.Log;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        try {
            Log.d(TAG, "Inicializando Firebase...");
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
                Log.d(TAG, "Firebase inicializado com sucesso");
            } else {
                Log.d(TAG, "Firebase já estava inicializado");
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao inicializar Firebase", e);
            e.printStackTrace();
        }

        super.onCreate(savedInstanceState);
    }
}
