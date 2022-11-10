describe("Sapiyon", () => {
  const username = "arfanliaqat10@gmail.com";
  const password = "secret123";

  beforeAll(async () => {
    jest.setTimeout(30000);
    await page.goto("http://localhost:3000");
  });

  it("should login and logout via User Menu link", async () => {
    await expect(page.title()).resolves.toBe("Sapiyon");

    await expect(page).toMatchElement("h1", {
      text: "Giriş Yap",
    });

    const usernnameSelector = "input[placeholder='E-posta / Kullanıcı adı']";
    const passwordSelector = "input[placeholder=Şifre]";

    await expect(page).toMatchElement(usernnameSelector);
    await expect(page).toMatchElement(passwordSelector);

    await expect(page).toFill(usernnameSelector, username);
    await expect(page).toFill(passwordSelector, password);

    await expect(page).toClick("button", { text: "Giriş Yap" });
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await expect(page.url()).toBe("http://localhost:3000/");

    await expect(page).toMatchElement("a", { text: "Anasayfa" });

    await expect(page).toMatchElement(".UserMenu");
    await expect(page).toClick(".UserMenu");

    await expect(page).toMatchElement(".Logout", { text: "Çıkış Yap" });
    await expect(page).toClick(".Logout", { text: "Çıkış Yap" });

    await page.waitForNavigation({ waitUntil: "load" });

    await expect(page.url()).toBe("http://localhost:3000/login");
    await expect(page).toMatchElement("h1", {
      text: "Giriş Yap",
    });
  });

  it("should login and logout via /logout", async () => {
    await expect(page.title()).resolves.toBe("Sapiyon");

    await expect(page).toMatchElement("h1", {
      text: "Giriş Yap",
    });

    const usernnameSelector = "input[placeholder='E-posta / Kullanıcı adı']";
    const passwordSelector = "input[placeholder=Şifre]";

    await expect(page).toMatchElement(usernnameSelector);
    await expect(page).toMatchElement(passwordSelector);

    await expect(page).toFill(usernnameSelector, username);
    await expect(page).toFill(passwordSelector, password);

    await expect(page).toClick("button", { text: "Giriş Yap" });
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await expect(page.url()).toBe("http://localhost:3000/");

    await expect(page).toMatchElement("a", { text: "Anasayfa" });

    await page.goto("http://localhost:3000/logout");

    await page.waitForNavigation({ waitUntil: "load" });

    await expect(page.url()).toBe("http://localhost:3000/login");
    await expect(page).toMatchElement("h1", {
      text: "Giriş Yap",
    });
  });

  it.skip("should fail on wrong authentication", () => {
    expect(true).toBe(false);
  });

  it.skip("should display proper error messages for validations", () => {
    expect(true).toBe(false);
  });
});
