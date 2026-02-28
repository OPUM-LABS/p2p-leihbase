/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
   let processed = [];

  const users = app.findAllRecords("users")
  users.forEach(user => {
    // Skip users already poccessed during another duplication loop
    if (processed.includes(user.id)) {
      return;
    }

    // Get all users with this email address
    const all = app.findRecordsByFilter("users", `email:lower = '${user.email().toLowerCase()}'`, null, 10, 0)
    if (!all || all.length === 1) {
      return;
    }

    // Only process each duplicate user once
    processed = processed.concat(all.map(u => u.id))

    let chosen;

    // Find the user with most reservations
    const usersWithReservations = [];
    let reservations = [];
    all.forEach(one => {
      const r = app.findRecordsByFilter("reservations", `user = '${one.id}'`, null, 50, 0)
      reservations = reservations.concat(r)
      usersWithReservations.push({ user: one, reservations: r.length});
    })
    usersWithReservations.sort((a, b) => b.reservations - a.reservations)
    if (usersWithReservations[0].reservations > usersWithReservations[1].reservations) {
      console.log("choose most reservations", usersWithReservations[0].user.email(), usersWithReservations[0].reservations)
      chosen = usersWithReservations[0].user
    } else {
      // Find the user with email written lowercase
      chosen = all.find(u => u.email() === user.email().toLowerCase())
      if (chosen) {
      console.log("choose lowercase", chosen.email())
      } else {
        // Pick a random user
        chosen = all[0];
        console.log("choose random", chosen.email())
      }
    }

    // Move reservations to chosen user
    reservations.forEach(r => {
      if (r.get('user') !== chosen.id) {
        r.set('user', chosen.id)
        app.save(r);
      }
    })

    // Remove other users
    all.forEach((u) => {
      if (u.id !== chosen.id) {
        app.delete(u)
      }
    })
  })
}, (app) => {
  // add down queries...
})
