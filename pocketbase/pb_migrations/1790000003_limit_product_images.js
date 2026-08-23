/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04"); // products

  const imagesField = collection.fields.getByName("images");
  if (imagesField) {
    imagesField.maxSelect = 3;
    imagesField.maxSize = 10485760; // 10MB
    imagesField.thumbs = ["600x0", "1200x0"];
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("oxgh1la125efx04");
  const imagesField = collection.fields.getByName("images");
  if (imagesField) {
    imagesField.maxSelect = 99;
  }
  return app.save(collection);
});
