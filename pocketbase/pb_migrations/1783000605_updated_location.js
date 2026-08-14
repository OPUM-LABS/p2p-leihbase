/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // add field
  collection.fields.addAt(13, new Field({
    "help": "Allows reservations to start and end on the same day.",
    "hidden": false,
    "id": "bool3141430231",
    "name": "allow_same_day_reservations",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  app.save(collection)

  // Set default 'reservation_system' for all locations
  const locations = app.findAllRecords("location")
  locations.forEach(location => {
    const json = location.getString('config')
    let config;
    try {
      config = JSON.parse(json || '{}');
    } catch (e) { }
    if (config && config.allow_same_day_reservations) {
      location.set('allow_same_day_reservations', config.allow_same_day_reservations || false);
      app.save(location);
    }
  });
}, (app) => {
  const collection = app.findCollectionByNameOrId("nkbfankqkyubdu9")

  // remove field
  collection.fields.removeById("bool3141430231")

  return app.save(collection)
})
