/// <reference path="../pb_data/types.d.ts" />

/**
 * Automatically syncs SMTP and Mail sender settings from environment variables
 * on PocketBase bootstrap / startup.
 */
onBootstrap((e) => {
  e.next();

  const settings = $app.settings();
  let modified = false;

  const smtpHost = $os.getenv("CONFIG_SMTP_HOST") || $os.getenv("SMTP_HOST");
  const smtpPort = $os.getenv("CONFIG_SMTP_PORT") || $os.getenv("SMTP_PORT");
  const smtpUser = $os.getenv("CONFIG_SMTP_USERNAME") || $os.getenv("SMTP_USERNAME");
  const smtpPass = $os.getenv("CONFIG_SMTP_PASSWORD") || $os.getenv("SMTP_PASSWORD");
  const smtpTls = $os.getenv("CONFIG_SMTP_TLS") || $os.getenv("SMTP_TLS");
  const smtpAuth = $os.getenv("CONFIG_SMTP_AUTH_METHOD") || $os.getenv("SMTP_AUTH_METHOD");
  const smtpEnabled = $os.getenv("CONFIG_SMTP_ENABLED") || $os.getenv("SMTP_ENABLED");
  const appName = $os.getenv("CONFIG_APP_NAME") || $os.getenv("APP_NAME") || "Leihbase";
  const senderAddress = $os.getenv("CONFIG_SMTP_SENDER_ADDRESS") || $os.getenv("SMTP_SENDER_ADDRESS");
  const senderName = $os.getenv("CONFIG_SMTP_SENDER_NAME") || $os.getenv("SMTP_SENDER_NAME") || appName;
  const appURL = $os.getenv("CONFIG_APP_URL") || $os.getenv("APP_URL");

  if (settings.meta.appName !== appName) {
    settings.meta.appName = appName;
    modified = true;
  }

  if (smtpHost) {
    settings.smtp.host = smtpHost;
    settings.smtp.enabled = smtpEnabled !== "false" && smtpEnabled !== "0";
    modified = true;
  } else if (smtpEnabled === "false" || smtpEnabled === "0") {
    settings.smtp.enabled = false;
    modified = true;
  }

  let portNum = 587;
  if (smtpPort) {
    const parsed = parseInt(smtpPort, 10);
    if (!isNaN(parsed)) {
      portNum = parsed;
      settings.smtp.port = portNum;
      modified = true;
    }
  }

  if (smtpUser !== undefined && smtpUser !== "") {
    settings.smtp.username = smtpUser;
    modified = true;
  }

  if (smtpPass !== undefined && smtpPass !== "") {
    settings.smtp.password = smtpPass;
    modified = true;
  }

  if (smtpTls !== undefined && smtpTls !== "") {
    settings.smtp.tls = smtpTls === "true" || smtpTls === "1";
    modified = true;
  } else if (smtpHost) {
    // Default tls based on port: 465 is implicit TLS, 587/25 use STARTTLS (tls=false)
    settings.smtp.tls = portNum === 465;
    modified = true;
  }

  if (smtpAuth) {
    settings.smtp.authMethod = smtpAuth;
    modified = true;
  }

  if (senderAddress) {
    settings.meta.senderAddress = senderAddress;
    modified = true;
  }

  if (settings.meta.senderName !== senderName) {
    settings.meta.senderName = senderName;
    modified = true;
  }

  if (appURL && settings.meta.appURL !== appURL) {
    settings.meta.appURL = appURL;
    modified = true;
  }

  if (modified) {
    try {
      $app.save(settings);
      console.log(`[PocketBase] SMTP settings applied: host=${settings.smtp.host}:${settings.smtp.port}, authMethod=${settings.smtp.authMethod || 'LOGIN'}, tls=${settings.smtp.tls}, enabled=${settings.smtp.enabled}, sender=${settings.meta.senderAddress}`);
    } catch (err) {
      console.error("[PocketBase] Error saving SMTP settings from environment variables:", err);
    }
  }

  // Sync app name to the default leihbase record if configured
  if (appName) {
    try {
      const records = $app.findRecordsByFilter("leihbase", "1=1", "-created", 1);
      if (records && records.length > 0) {
        const record = records[0];
        if (record.get("name") !== appName) {
          record.set("name", appName);
          $app.save(record);
          console.log(`[PocketBase] Updated leihbase record name to "${appName}"`);
        }
      }
    } catch (err) {
      // Collection might not be created during early bootstrap
    }
  }
});
