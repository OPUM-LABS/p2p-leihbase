/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const { requestInfo, record } = e;

  if (!record) {
    throw new BadRequestError();
  }

  // Validate captcha, if captcha is enabled
  const capInstanceHost = $os.getenv("CONFIG_CAP_INSTANCE_HOST");
  const capSiteKey = $os.getenv("CONFIG_CAP_SITE_KEY");
  const capSecretKey = $os.getenv("CONFIG_CAP_SECRET_KEY");
  if (capInstanceHost && capSiteKey && capSecretKey) {
    const body = requestInfo().body;
    if (!body["cap-token"]) {
      throw new BadRequestError("Captcha_invalid.");
    }

    const res = $http.send({
      url: `https://${capInstanceHost}/${capSiteKey}/siteverify`,
      method: "POST",
      body: JSON.stringify({
        secret: capSecretKey,
        response: body["cap-token"],
      }),
      headers: { "Content-Type": "application/json" },
      timeout: 30,
    });

    if (!res.json.success) {
      throw new Error("Captcha_invalid.");
    }
  }

  // Make sure privacy policy has been accepted, if defined
  const leihbase = $app.findAllRecords("leihbase")[0];
  if (leihbase?.get('privacy_policy_link') && !record.getBool('terms')) {
    throw new BadRequestError("Terms_required.")
  }

  record.set("role", "user");

  if (!record.getString("locale")) {
    const body = requestInfo().body || {};
    const bodyLocale = body.locale;
    if (bodyLocale) {
      record.set("locale", bodyLocale.toLowerCase().startsWith("de") ? "de" : "en");
    } else {
      record.set("locale", "de");
    }
  }

  e.next();
}, "users");

onRecordEnrich((e) => {
  if (!e.record) {
    e.next();
    return;
  }

  let isSuperuser = false;
  let authRecord = null;
  try {
    if (typeof e.requestInfo === "function") {
      const info = e.requestInfo();
      isSuperuser = !!info?.superuser;
      authRecord = info?.auth;
    } else if (e.requestInfo) {
      isSuperuser = !!e.requestInfo.superuser;
      authRecord = e.requestInfo.auth;
    }
  } catch (_) { }

  const isOwner = authRecord && authRecord.id === e.record.id;
  const isAdmin = authRecord && authRecord.get && authRecord.get("role") === "admin";

  let isCounterparty = false;
  if (authRecord && authRecord.id !== e.record.id) {
    try {
      const related = $app.findRecordsByFilter(
        "reservations",
        "((owner = {:authId} && user = {:targetId}) || (user = {:authId} && owner = {:targetId})) && cancelled != true",
        null,
        1,
        0,
        {
          authId: authRecord.id,
          targetId: e.record.id,
        }
      );
      if (related && related.length > 0) {
        isCounterparty = true;
      }
    } catch (_) { }
  }

  if (!isSuperuser && !isAdmin && !isOwner && !isCounterparty) {
    e.record.hide("address");
  } else {
    e.record.unhide("role");
    e.record.unhide("manager_locations");
    e.record.unhide("address");
  }

  e.next();
}, "users");
