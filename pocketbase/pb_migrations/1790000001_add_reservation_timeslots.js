/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const reservationsCollection = app.findCollectionByNameOrId("h7plyphsy0mgjpf");

  // Add timeslots json field
  reservationsCollection.fields.add(new Field({
    "hidden": false,
    "id": "res_timeslots",
    "maxSize": 2000000,
    "name": "timeslots",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }));

  app.save(reservationsCollection);
}, (app) => {
  const reservationsCollection = app.findCollectionByNameOrId("h7plyphsy0mgjpf");
  try {
    reservationsCollection.fields.removeById("res_timeslots");
    app.save(reservationsCollection);
  } catch (e) {}
});
