import { Realm } from 'realm';
import { ReminderSchema } from './schemas/remind.schema';
export const getRealm = async () =>
   Realm.open({
      path: 'medtime-app',
      schema: [ReminderSchema]
   });
