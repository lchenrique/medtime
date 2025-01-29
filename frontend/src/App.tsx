import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Toaster } from 'react-hot-toast'
import { setupIonicReact, IonApp } from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'; 

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

/**
 * Ionic Dark Theme
 * -----------------------------------------------------
 * For more information, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

// import '@ionic/react/css/palettes/dark.always.css';
// import '@ionic/react/css/palettes/dark.class.css';
// import '@ionic/react/css/palettes/dark.system.css';

// Configuração do Ionic para usar nosso tema
setupIonicReact({
  mode: 'md',
  animated: true
});

export default function App() {
  return (
    <>
      <IonApp className="ion-no-padding">
        <RouterProvider router={router} />
        <Toaster />
      </IonApp>
    </>
  )
}
