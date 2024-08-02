import Realm, { type ObjectSchema } from 'realm';

const ReminderSchema: ObjectSchema = {
   name: 'Reminder',
   primaryKey: '_id',
   properties: {
      _id: 'ObjectId',
      name: 'string',
      dosage: 'string',
      times: 'list<string>',
      notes: 'string?',
      completed: { type: 'bool', default: false }
   }
};
type Reminder = {
   _id: Realm.BSON.ObjectId;
   name: string;
   dosage: string;
   times: string[];
   notes?: string;
   completed: boolean;
};

class ReminderModel extends Realm.Object<ReminderModel> {
   _id!: Realm.BSON.ObjectId;
   name!: string;
   dosage!: string;
   times!: string[];
   notes?: string;
   completed!: boolean;

   static schema: ObjectSchema = ReminderSchema;
}

export { Reminder, ReminderModel, ReminderSchema };
