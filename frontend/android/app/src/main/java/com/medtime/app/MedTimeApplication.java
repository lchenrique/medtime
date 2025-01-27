package com.medtime.app;

import android.app.Application;
import android.util.Log;
import com.google.firebase.FirebaseApp;

public class MedTimeApplication extends Application {
    private static final String TAG = "MedTimeApplication";

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            Log.d(TAG, "Inicializando Firebase no Application...");
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
                Log.d(TAG, "Firebase inicializado com sucesso no Application");
            } else {
                Log.d(TAG, "Firebase já estava inicializado no Application");
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao inicializar Firebase no Application", e);
            e.printStackTrace();
        }
    }
} 