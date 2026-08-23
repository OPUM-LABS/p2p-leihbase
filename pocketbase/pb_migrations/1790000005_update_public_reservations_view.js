/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("public_reservations");
  collection.viewQuery = "SELECT id, product, start, end FROM reservations WHERE (cancelled IS NOT TRUE) AND (status IS NULL OR (status != 'cancelled' AND status != 'declined' AND status != 'ended'))";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("public_reservations");
  collection.viewQuery = "SELECT id, product, start, end FROM reservations WHERE cancelled IS FALSE";
  return app.save(collection);
});

