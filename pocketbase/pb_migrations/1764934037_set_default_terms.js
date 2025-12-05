/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  // note: if you have a lot of users (eg. 100k+) you may want to get them on batches
  const users = arrayOf(new Record);
  dao.recordQuery(collection.name).all(users);

  for (let user of users) {
    user.set('terms', true);
    dao.saveRecord(user)
  }
}, null)
