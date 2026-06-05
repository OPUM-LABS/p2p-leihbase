/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest(async (e) => {
  const { requestInfo } = e;

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

  e.next();
}, "users");
