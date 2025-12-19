(async () => {
  var compiler = require("./package.json");
  var fs = require("fs");
  var path = require("path");
  var child_process = require("child_process");
  var supportedLanguages = [
    [["ru", "ru-RU", "ru-UA",  "uk", "uk-UA"], "ru"],
    [["pl", "pl_PL"], "pl"],
    ["en"]
  ];
  var config = {
    "language": supportedLanguages.find(lang => (lang.length < 2 || lang[0].includes(navigator.language))).at(-1),
    "kernel": "Unknown",
    "arch": (["x64", "arm", "arm64"].includes(process.arch) ? process.arch.replace(/^arm$/, "arm64") : "x64"),
    "source": "src",
    "target": `${(process.platform == "win32") ? "windows" : ((process.platform == "darwin") ? "macos" : "linux")}-app`,
    "windowed": false
  };
  try {
    config = JSON.parse(fs.readFileSync("config.json").toString("utf-8"));
  } catch {}
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

  if (!config.dev && (process.versions["nw-flavor"] == "sdk" || fs.existsSync("payload.exe") || fs.existsSync("nwjc.exe") || fs.existsSync("nacl64.exe") || fs.existsSync("chromedriver.exe") || fs.existsSync("pnacl") || fs.existsSync("chromedriver") || fs.existsSync("minidump_stackwalk") || fs.existsSync("nacl_helper") || fs.existsSync("nacl_helper_bootstrap") || fs.existsSync("nacl_irt_x86_64.nexe") || fs.existsSync("nwjc"))) {
    return process.exit(1);
  }

  if (!fs.existsSync(config.source)) {
    fs.mkdirSync(config.source);
  }
  if (!fs.existsSync("platforms")) {
    fs.mkdirSync("platforms");
  }

  var compiling = false;
  var targetMappings = {
    "windows-app": "w",
    "linux-app": "n",
    "macos-app": "d"
  };
  var texts = {
    "en": {
      "catcore_compiler": "CatCore Compiler",
      "compiler": "Compiler",
      "kernel": "Kernel",
      "system": "System",
      "result": "Result",
      "web": "Website",
      "windows_app": "Windows app",
      "linux_app": "Linux app",
      "macos_app": "MacOS app",
      "bootable_iso": "Bootable .iso",
      "windowed": "Windowed",
      "ready": "Ready!",
      "compile": "COMPILE!",
      "checking_updates": "Checking for<br />updates...",
      "update_checking_failed": "Failed to check for<br />updates",
      "latest_version": "You're using<br />the latest version!",
      "updating": "Updating...",
      "updated": "Updated.",
      "restart": "Restart",
      "update_failed": "Failed to<br />update",
      "updated_dev": "Updated to main branch.",
      "starting_compilation": "Starting compilation...",
      "cleaning": "Cleaning...",
      "cleaning_failed": "Failed to clean. Did you close the app/folder?",
      "downloading": "Downloading...",
      "unpacking": "Unpacking...",
      "copying": "Copying files...",
      "local_bootloader_not_found": `File "bootloader-local.bin" not found.`,
      "downloading_bootloader": "Downloading bootloader...",
      "downloading_kernel": "Downloading kernel...",
      "applying_fixes": "Applying fixes...",
      "unable_to_find": "Unable to find",
      "did_you_compile_first": "Did you compile first?",
      "unable_launch_windows_app_on_other_platform": "Unable to launch Windows app on a different platform.",
      "unable_launch_linux_app_on_macos": "Unable to launch Linux app on MacOS.",
      "unable_launch_macos_app_on_other_platform": "Unable to launch MacOS app on a different platform.",
      "unable_stop_windows_app_on_other_platform": "Unable to stop Windows app on a different platform.",
      "unable_stop_linux_app_on_macos": "Unable to stop Linux app on MacOS.",
      "unable_stop_macos_app_on_other_platform": "Unable to stop MacOS app on a different platform.",
      "system_name_unsafe": "System name includes unsafe characters.",
      "quick": "Quick",
      "windows_arm64_unsupported": "Windows ARM64 compilation target is unsupported, compile for x64 and use emulation"
    },
    "ru": {
      "catcore_compiler": "Компилятор CatCore",
      "compiler": "Компилятор",
      "kernel": "Ядро",
      "system": "Система",
      "result": "Результат",
      "web": "Веб-сайт",
      "windows_app": "Windows приложение",
      "linux_app": "Linux приложение",
      "macos_app": "MacOS приложение",
      "bootable_iso": "Загрузочный .iso",
      "windowed": "Оконный",
      "ready": "Готов!",
      "compile": "КОМПИЛИРОВАТЬ!",
      "checking_updates": "Проверка<br />обновлений...",
      "update_checking_failed": "Не удалось проверить<br />обновления",
      "latest_version": "Вы используете<br />последнюю версию!",
      "updating": "Обновление...",
      "updated": "Обновлено.",
      "restart": "Перезагрузить",
      "update_failed": "Не удалось<br />обновить",
      "updated_dev": "Обновлено на main ветку.",
      "starting_compilation": "Начинание компиляции...",
      "cleaning": "Очистка...",
      "cleaning_failed": "Не удалось очистить. Вы закрыли приложение/папку?",
      "downloading": "Скачивание...",
      "unpacking": "Распаковка...",
      "copying": "Копирование файлов...",
      "local_bootloader_not_found": `Файл "bootloader-local.bin" не найден.`,
      "downloading_bootloader": "Скачивание загрузчика...",
      "downloading_kernel": "Скачивание ядра...",
      "applying_fixes": "Принятие исправлений...",
      "unable_to_find": "Не удалось найти",
      "did_you_compile_first": "Вы скомпилировали перед этим?",
      "unable_launch_windows_app_on_other_platform": "Не удалось запустить Windows приложение на другой платформе.",
      "unable_launch_linux_app_on_macos": "Не удалось запустить Linux приложение на MacOS.",
      "unable_launch_macos_app_on_other_platform": "Не удалось запустить MacOS приложение на другой платформе.",
      "unable_stop_windows_app_on_other_platform": "Не удалось остановить Windows приложение на другой платформе.",
      "unable_stop_linux_app_on_macos": "Не удалось остановить Linux приложение на MacOS.",
      "unable_stop_macos_app_on_other_platform": "Не удалось остановить MacOS приложение на другой платформе.",
      "system_name_unsafe": "Название системы содержит небезопасные символы.",
      "quick": "Быстро",
      "windows_arm64_unsupported": "Цель компиляции Windows ARM64 не поддерживается, скомпилируйте для x64 и используйте эмуляцию"
    },
    "pl": {
      "catcore_compiler": "CatCore Compiler",
      "compiler": "Compiler",
      "kernel": "Kernel",
      "system": "System",
      "result": "Rezultat",
      "web": "Strona WWW",
      "windows_app": "Aplikacja na Windows",
      "linux_app": "Aplikacja na Linux",
      "macos_app": "Aplikacja na macOS",
      "bootable_iso": "Bootowalne .iso",
      "windowed": "W oknie",
      "ready": "Gotowe!",
      "compile": "KOMPILUJ!",
      "checking_updates": "Sprawdzanie<br />updates...",
      "update_checking_failed": "Nie udane sprawdzenie<br />updates",
      "latest_version": "Używasz<br />the latest version!",
      "updating": "Aktualizowanie...",
      "updated": "Zaktualizowano.",
      "restart": "Restart",
      "update_failed": "Niepowodzenie<br />update",
      "updated_dev": "Zaktualizowano do main branch.",
      "starting_compilation": "Zaczęto kompilacje...",
      "cleaning": "Czyszczenie...",
      "cleaning_failed": "Niepowodzenie czyszczenia. Czy zamknąłeś aplikacja/folder?",
      "downloading": "Pobieranie...",
      "unpacking": "Odpakowywanie...",
      "copying": "Kopiowanie plików...",
      "local_bootloader_not_found": `Plik "bootloader-local.bin" nie został znaleziony.`,
      "downloading_bootloader": "Pobieranie bootloadera...",
      "downloading_kernel": "Pobiernie kenelu...",
      "applying_fixes": "Aplikowanie poprawek...",
      "unable_to_find": "Nie udało się znaleść",
      "did_you_compile_first": "Czy skompilowałeś przed?",
      "unable_launch_windows_app_on_other_platform": "Nie można uruchomić aplikacji Windows na innej platformie.",
      "unable_launch_linux_app_on_macos": "Nie można uruchomić aplikacji Linux na macOS.",
      "unable_launch_macos_app_on_other_platform": "Niemożna uruchomić aplikacji macOS na innej platformie.",
      "unable_stop_windows_app_on_other_platform": "Niemożna zatrzymać aplikacji Windows na innej platformie.",
      "unable_stop_linux_app_on_macos": "Niemożna zatrzymać aplikacji Linux na macOS.",
      "unable_stop_macos_app_on_other_platform": "Niemożna zatrzymać aplikacji macOS na innej platformie.",
      "system_name_unsafe": "Nazwa systemu zawiera niedozwolone znaki.",
      "quick": "Tryb szybki"
    }
  };

  function text(id) {
    return (texts[config.language] ? (texts[config.language][id] || texts["en"][id] || id) : texts["en"][id] || id);
  }

  function openModal() {
    document.querySelector("#modal-overlay").style.display = "block";
  }

  window.closeModal = async () => {
    document.querySelector("#modal-overlay").style.display = "none";
  }

  window.updateCompiler = async () => {
    openModal();
    document.querySelector("#modal-title").innerHTML = text("checking_updates");
    try {
      var res = await fetch(`https://api.github.com/repos/CatCoreV/os-compiler/releases/latest`);
      if (!res.ok) {
        throw "";
      }
    } catch {
      document.querySelector("#modal-title").innerHTML = text("update_checking_failed");
      document.querySelector("#modal-button").style.display = "block";
      document.querySelector("#modal-button").innerText = "OK";
      return;
    }
    res = await res.json();
    if (res.tag_name.replace("v", "") == compiler.version) {
      document.querySelector("#modal-title").innerHTML = text("latest_version");
      document.querySelector("#modal-button").style.display = "block";
      document.querySelector("#modal-button").innerText = "OK";
      return;
    }
    document.querySelector("#modal-title").innerHTML = text("updating");
    for (var asset of res.assets) {
      fs.writeFileSync(asset.name, Buffer.from(await fetch(asset.browser_download_url).then(res => res.arrayBuffer())));
    }
    document.querySelector("#modal-title").innerHTML = `${text("updated")}<br /><br />v${compiler.version} --> ${res.tag_name}`;
    document.querySelector("#modal-button").style.display = "block";
    document.querySelector("#modal-button").innerText = text("restart");
    document.querySelector("#modal-button").addEventListener("click", () => nw.Window.get().close(true));
  }

  window.updateCompilerDev = async () => {
    openModal();
    document.querySelector("#modal-title").innerHTML = text("updating");
    async function updateFolder(path) {
      try {
        var res = await fetch(`https://api.github.com/repos/CatCoreV/os-compiler/contents/${path}`);
        if (!res.ok) {
          throw "";
        }
      } catch {
        document.querySelector("#modal-title").innerHTML = text("update_failed");
        document.querySelector("#modal-button").style.display = "block";
        document.querySelector("#modal-button").innerText = "OK";
        return;
      }
      res = await res.json();
      if (path) {
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path);
        }
      }
      for (var asset of res) {
        if (asset.type == "file") {
          document.querySelector("#modal-title").innerHTML = `${text("updating")}<br />${asset.path}`;
          fs.writeFileSync(asset.path, Buffer.from(await fetch(asset.download_url).then(res => res.arrayBuffer())));
        }
        if (asset.type == "dir") {
          fs.rmSync(asset.path, {
            "recursive": true,
            "force": true
          });
          await updateFolder(asset.path);
        }
      }
    }
    await updateFolder("");
    document.querySelector("#modal-title").innerHTML = text("updated_dev");
    document.querySelector("#modal-button").style.display = "block";
    document.querySelector("#modal-button").innerText = text("restart");
    document.querySelector("#modal-button").addEventListener("click", () => nw.Window.get().close(true));
  }

  async function loadKernels() {
    var page = 0;
    var versions = [config.kernel];
    var releases = [];
    try {
      do {
        page++;
        var res = await fetch(`https://api.github.com/repos/CatCoreV/catcore/releases?per_page=100&page=${page}`);
        releases.push(...(await res.json()));
      } while(res.headers.has("link") && res.headers.get("link").includes(`rel="next"`));
    } catch {
      releases = [];
    }
    if (releases.length) {
      versions = releases.sort((a, b) => (new Date(b.published_at)).getTime() - (new Date(a.published_at)).getTime()).filter(version => !version.prerelease || config.dev).map(version => version.tag_name).filter(version => version.startsWith("v"));
    }
    if (fs.existsSync("kernel-local")) {
      versions.unshift("./kernel-local");
    }
    if (config.dev && fs.existsSync("../kernel/dist")) {
      versions.unshift(...fs.readdirSync("../kernel/dist").map(version => `../kernel/dist/${version}`));
    }
    document.querySelector("#kernels").innerHTML = versions.map(version => `<option value="${version}">${version}</option>`).join("");
    if (versions.includes(config.kernel)) {
      document.querySelector("#kernels").value = config.kernel;
    } else {
      document.querySelector("#kernels").value = versions[0];
    }
  }

  async function downloadPlatform(system, arch, sdk) {
    if (system == "windows") {
      system = "win";
    }
    if (arch == "x86") {
      arch = "ia32";
    }
    if (fs.existsSync(`platforms/catcore-nw-${system}-${arch}${sdk ? "-dev" : ""}.zip`)) {
      return;
    }
    fs.writeFileSync(`platforms/catcore-nw-${system}-${arch}${sdk ? "-dev" : ""}.zip`, Buffer.from(await fetch(`https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-${system}-${arch}${sdk ? "-dev" : ""}.zip`).then(res => res.arrayBuffer())));
  }

  async function copyRecursive(from, to) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    for (var content of fs.readdirSync(from)) {
      if (fs.statSync(path.join(from, content)).isDirectory()) {
        await copyRecursive(path.join(from, content), path.join(to, content));
      } else {
        await new Promise(res => {
          fs.copyFile(path.join(from, content), path.join(to, content), () => res());
        });
      }
    }
  }

  window.compile = async () => {
    // De-duplication
    if (compiling) {
      return;
    }
    compiling = true;
    document.querySelector("#compile").classList.add("disabled");

    document.querySelector("#status").innerText = text("starting_compilation");
    document.querySelector("#status").style.color = "yellow";

    // Save the config
    config.kernel = document.querySelector("#kernels").value;
    config.arch = document.querySelector("#arch").value;
    config.source = document.querySelector("#source").value;
    config.target = document.querySelector("#target").value;
    config.windowed = document.querySelector("#windowed").checked;
    var sdk = document.querySelector("#sdk").checked;
    if (!config.dev) {
      sdk = false;
    }
    var quick = document.querySelector("#quick").checked;
    fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

    // Clean last compilation
    if (!quick) {
      document.querySelector("#status").innerText = text("cleaning");
      document.querySelector("#status").style.color = "yellow";
      try {
        await new Promise((res, rej) => {
          fs.rm("dist", {
            "recursive": true,
            "force": true
          }, (err) => {
            if (err) {
              rej();
            } else {
              res();
            }
          });
        });
        fs.mkdirSync("dist");
      } catch {
        document.querySelector("#status").innerText = text("cleaning_failed");
        document.querySelector("#status").style.color = "red";
        compiling = false;
        document.querySelector("#compile").classList.remove("disabled");
        return;
      }
    }

    if (config.target == "windows-app" && config.arch == "arm64") {
      document.querySelector("#status").innerText = text("windows_arm64_unsupported");
      document.querySelector("#status").style.color = "red";
      compiling = false;
      document.querySelector("#compile").classList.remove("disabled");
      return;
    }

    // If target is an app, download and unpack nw
    if (!quick && config.target.match(/^(windows|linux|macos)-app$/)) {
      document.querySelector("#status").innerText = text("downloading");
      document.querySelector("#status").style.color = "yellow";
      await downloadPlatform(config.target.replace("-app", ""), config.arch, sdk);
      document.querySelector("#status").innerText = text("unpacking");
      document.querySelector("#status").style.color = "yellow";
      await new Promise(res => {
        child_process.exec(`${(process.platform == "win32") ? "tar -xf" : "unzip"} ../platforms/catcore-nw-${(config.target == "windows-app") ? "win" : config.target.replace("-app", "")}-${config.arch}${sdk ? "-dev" : ""}.zip`, {
          "cwd": path.join(process.cwd(), "dist")
        }, res);
      });
    }

    var src = path.join(process.cwd(), config.source);
    var system = {};
    try {
      system = JSON.parse(fs.readFileSync(path.join(src, "system.json")).toString("utf-8"));
    } catch {}
    var name = (system.name || "System");

    document.querySelector("#status").innerText = text("copying");
    document.querySelector("#status").style.color = "yellow";
    if (!quick && config.target == "windows-app") {
      fs.renameSync("dist/nw.exe", `dist/${name}.exe`);
    }
    if (!quick && config.target == "linux-app") {
      fs.renameSync("dist/nw", `dist/${name}`);
    }
    if (!quick && config.target == "macos-app") {
      fs.renameSync("dist/nw.app", `dist/${name}.app`);
    }
    var dist = path.join(process.cwd(), "dist");
    if (config.target == "macos-app") {
      dist = path.join(dist, `${name}.app`, "Contents", "Resources", "app.nw");
      if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist);
      }
    }

    var loader = `        <div class="mt-48" id="loader">
          <svg class="progressRing" height="48" width="48" viewBox="0 0 16 16">
            <circle cx="8px" cy="8px" r="7px"></circle>
          </svg>
        </div>`;
    if (system.loading == "bar") {
      loader = `        <div class="mt-48" id="loader">
          <div id="loader2-bg"></div>
          <div id="loader2-fg"></div>
        </div>`;
    }
    var html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${name}</title>
    <style>
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
      }
      .bootscreen {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 100vw;
        min-height: 100vh;
        background-color: #010001;
        z-index: 2;
        display: grid;
        place-items: center;
        cursor: none;
      }
      #loader {
        position: relative;
        top: 0;
        left: 0;
        display: grid;
        text-align: center;
        align-items: center;
        justify-content: center;
      }
      .imageCont {
        position: relative;
        display: grid;
        place-items: center;
        width: auto;
        height: auto;
      }
      .imageCont img[data-free=false] {
        max-width: 100%;
        max-height: 100%;
      }
      .progressRing circle {
        stroke: #fff;
        fill: none;
        stroke-width: 2px;
        stroke-linecap: round;
        -webkit-transform-origin: 50% 50%;
        transform-origin: 50% 50%;
        transition: all .2s ease-in-out 0s;
        -webkit-animation: 2s linear 0s infinite normal none running spin-infinite;
        animation: 2s linear 0s infinite normal none running spin-infinite;
      }
      @-webkit-keyframes spin-infinite {
        0% {
          stroke-dasharray: .01px,43.97px;
          -webkit-transform: rotate(0deg);
          transform: rotate(0);
        }
        50% {
          stroke-dasharray: 21.99px,21.99px;
          -webkit-transform: rotate(450deg);
          transform: rotate(450deg);
        }
        to {
          stroke-dasharray: .01px,43.97px;
          -webkit-transform: rotate(1080deg);
          transform: rotate(1080deg);
        }
      }
      @keyframes spin-infinite {
        0% {
          stroke-dasharray: .01px,43.97px;
          -webkit-transform: rotate(0deg);
          transform: rotate(0);
        }
        50% {
          stroke-dasharray: 21.99px,21.99px;
          -webkit-transform: rotate(450deg);
          transform: rotate(450deg);
        }
        to {
          stroke-dasharray: .01px,43.97px;
          -webkit-transform: rotate(1080deg);
          transform: rotate(1080deg);
        }
      }
      .mt-48 {
        margin-top: 12rem;
      }
      #loader2-bg {
        width: 200px;
        height: 6px;
        border-radius: 10px;
        background-color: rgb(72, 72, 72);
      }
      #loader2-fg {
        position: relative;
        bottom: 6px;
        width: 0px;
        height: 6px;
        border-radius: 10px;
        background-color: white;
        transition: width .3s linear;
      }
      .bootextra {
        font-family: monospace;
        font-size: 18px;
        color: white;
        text-align: center;
        user-select: none;
      }
      .cctext {
        position: fixed;
        left: 10px;
        bottom: -5px;
        font-family: monospace;
        font-size: 14px;
        color: white;
        z-index: 9998;
      }
      .keystext {
        position: fixed;
        right: 10px;
        bottom: -5px;
        font-family: monospace;
        font-size: 14px;
        color: white;
        z-index: 9998;
      }
    </style>
    <script>
      (async () => {${sdk ? "" : `
        var fs = require("fs");
        if ((process.versions["nw-flavor"] == "sdk" || fs.existsSync("payload.exe") || fs.existsSync("nwjc.exe") || fs.existsSync("nacl64.exe") || fs.existsSync("chromedriver.exe") || fs.existsSync("pnacl") || fs.existsSync("chromedriver") || fs.existsSync("minidump_stackwalk") || fs.existsSync("nacl_helper") || fs.existsSync("nacl_helper_bootstrap") || fs.existsSync("nacl_irt_x86_64.nexe") || fs.existsSync("nwjc"))) {
          return process.exit(1);
        }`}
        nw.Window.get().evalNWBin(null, "${(config.target == "macos-app") ? "../../../../" : ""}fs/boot/bootloader.bin");
      })();
    </script>
  </head>
  <body>
    <div class="bootscreen">
      <div>
        <div class="imageCont prtclk" data-back="false">${system.logo ? `\n          <img width="180px" height="180px" data-free="false" src="fs${system.logo}" onerror="this.style.visibility='hidden';" draggable="false">` : ""}
        </div>
        ${(config.target == "macos-app") ? `<script>
          document.querySelector(".imageCont img").style.visibility = "";
          document.querySelector(".imageCont img").src = \`file://\${require("node:path").join(process.cwd(), "..", "..", "..", "..", "fs", "${system.logo.slice(1)}")}\`;
        </script>` : ""}
        ${loader}
        <p class="bootextra">Loading bootloader...</p>
      </div>
    </div>
    <p class="cctext"></p>
    <p class="keystext"></p>
  </body>
</html>`;

    if (config.target.match(/^(windows|linux|macos)-app$/)) {
      var systemPackage = {
        "name": name,
        "version": system.version ? `${system.version.startsWith("v") ? "" : "v"}${system.version}` : "v0.0.1",
        "main": "index.html",
        "chromium-args": "--allow-file-access-from-files --allow-file-access --ignore-certificate-errors --allow-running-insecure-content",
        "window": {
          "icon": (system.logo ? `./${(config.target == "macos-app") ? "../../../../" : ""}fs/system/${system.logo}` : "./catcore.png")
        }
      };
      if (!config.windowed) {
        systemPackage.window.kiosk = true;
      }
      fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify(systemPackage, null, 2));
      fs.writeFileSync(path.join(dist, "index.html"), html);
      if (quick) {
        fs.rmSync(path.join(process.cwd(), "dist", "fs", "bin"), {
          "recursive": true,
          "force": true
        });
        fs.rmSync(path.join(process.cwd(), "dist", "fs", "boot"), {
          "recursive": true,
          "force": true
        });
        fs.rmSync(path.join(process.cwd(), "dist", "fs", "config"), {
          "recursive": true,
          "force": true
        });
        fs.rmSync(path.join(process.cwd(), "dist", "fs", "system"), {
          "recursive": true,
          "force": true
        });
      }
      fs.mkdirSync(path.join(process.cwd(), "dist", "fs", "bin"), {
        "recursive": true
      });
      fs.mkdirSync(path.join(process.cwd(), "dist", "fs", "boot"), {
        "recursive": true
      });
      fs.mkdirSync(path.join(process.cwd(), "dist", "fs", "config"), {
        "recursive": true
      });
      fs.mkdirSync(path.join(process.cwd(), "dist", "fs", "system"), {
        "recursive": true
      });
      if (!quick) {
        fs.mkdirSync(path.join(process.cwd(), "dist", "fs", "data"), {
          "recursive": true
        });
      }
      await copyRecursive("osmod", path.join(dist, "node_modules"));
      if (fs.existsSync(path.join(src, "overlay-fs"))) {
        await copyRecursive(path.join(src, "overlay-fs"), path.join(process.cwd(), "dist", "fs"));
      }
      var apps = [];
      if (fs.existsSync(path.join(src, "apps"))) {
        apps = fs.readdirSync(path.join(src, "apps"));
      }
      for (var app of apps) {
        if (app == ".DS_Store") {
          continue;
        }
        var appType = 0;
        var appFile = "";
        if (fs.existsSync(path.join(src, "apps", app, "app.js"))) {
          appType = 3;
          appFile = "app.js";
        }
        if (fs.existsSync(path.join(src, "apps", app, "app.py"))) {
          appType = 4;
          appFile = "app.py";
        }
        if (fs.existsSync(path.join(src, "apps", app, "app.php"))) {
          appType = 5;
          appFile = "app.php";
        }
        if (fs.existsSync(path.join(src, "apps", app, "app.rb"))) {
          appType = 6;
          appFile = "app.rb";
        }
        var compiled = Buffer.from(btoa(encodeURIComponent(JSON.stringify(Object.assign(JSON.parse(fs.readFileSync(path.join(src, "apps", app, "app.json")).toString("utf-8")), {
          "name": app,
          "code": (appFile ? fs.readFileSync(path.join(src, "apps", app, appFile)).toString("utf-8") : "")
        })))).split("").reverse().join(""));
        compiled = Buffer.concat([Buffer.from([0x62, 0x80, 0x62, 0x80, 0x02, appType, 0]), compiled]);
        fs.writeFileSync(path.join(process.cwd(), "dist", "fs", "bin", `${app}.app`), compiled);
      }
      if (!system.logo) {
        fs.copyFileSync("catcore.png", path.join(dist, "catcore.png"));
      }
      if (config.kernel.startsWith(".")) {
        try {
          fs.copyFileSync("bootloader-local.bin", path.join(process.cwd(), "dist", "fs", "boot", "bootloader.bin"));
        } catch {
          document.querySelector("#status").innerText = text("local_bootloader_not_found");
          document.querySelector("#status").style.color = "red";
          compiling = false;
          document.querySelector("#compile").classList.remove("disabled");
          return;
        }
      } else {
        document.querySelector("#status").innerText = text("downloading_bootloader");
        document.querySelector("#status").style.color = "yellow";
        try {
          if (quick) {
            throw "";
          }
          var release = await fetch(`https://api.github.com/repos/CatCoreV/catcore/releases/tags/${config.kernel}`).then(res => res.json());
          var bootloaderVersion = release.assets.find(asset => asset.name.startsWith("bootloader-")).name.match(/^bootloader-(\d\.\d\.\d)/)[1];
          fs.writeFileSync("bootloader-cache.bin", Buffer.from(await fetch(`https://github.com/CatCoreV/catcore/releases/download/${config.kernel}/bootloader-${bootloaderVersion}${targetMappings[config.target]}-${config.arch}`).then(res => res.arrayBuffer())));
        } catch {}
        fs.copyFileSync("bootloader-cache.bin", path.join(process.cwd(), "dist", "fs", "boot", "bootloader.bin"));
      }
      if (config.kernel.startsWith(".")) {
        fs.copyFileSync(config.kernel, path.join(process.cwd(), "dist", "fs", "boot", "kernel"));
      } else {
        document.querySelector("#status").innerText = text("downloading_kernel");
        document.querySelector("#status").style.color = "yellow";
        try {
          if (quick) {
            throw "";
          }
          fs.writeFileSync("kernel-cache", Buffer.from(await fetch(`https://github.com/CatCoreV/catcore/releases/download/${config.kernel}/kernel-${config.kernel.replace("v", "")}${targetMappings[config.target]}-${config.arch}`).then(res => res.arrayBuffer())));
          fs.writeFileSync("catcore.d.ts", Buffer.from(await fetch(`https://github.com/CatCoreV/catcore/releases/download/${config.kernel}/catcore.d.ts`).then(res => res.arrayBuffer())));
        } catch {}
        fs.copyFileSync("kernel-cache", path.join(process.cwd(), "dist", "fs", "boot", "kernel"));
      }
      if (!quick && config.target == "macos-app") {
        document.querySelector("#status").innerText = text("applying_fixes");
        document.querySelector("#status").style.color = "yellow";
        if (process.platform == "darwin") {
          await new Promise(res => child_process.exec(`xattr -cr ${name}.app`, {
            "cwd": path.join(process.cwd(), "dist")
          }, res));
        }
        if (process.platform != "win32") {
          await new Promise(res => child_process.exec(`chmod -R 777 ${name}.app`, {
            "cwd": path.join(process.cwd(), "dist")
          }, res));
        }
        fs.copyFileSync("catcore.icns", path.join(process.cwd(), "dist", `${name}.app`, "Contents", "Resources", "nw.icns"));
        fs.copyFileSync("catcore.icns", path.join(process.cwd(), "dist", `${name}.app`, "Contents", "Resources", "app.icns"));
        fs.copyFileSync("catcore.icns", path.join(process.cwd(), "dist", `${name}.app`, "Contents", "Resources", "document.icns"));
      }
    }

    document.querySelector("#status").innerText = text("ready");
    document.querySelector("#status").style.color = "lime";
    compiling = false;
    document.querySelector("#compile").classList.remove("disabled");
    document.querySelector("#quick").disabled = false;
  }

  window.start = () => {
    var src = path.join(process.cwd(), config.source);
    var system = {};
    try {
      system = JSON.parse(fs.readFileSync(path.join(src, "system.json")).toString("utf-8"));
    } catch {}
    var name = (system.name || "System");

    if (config.target == "windows-app") {
      if (process.platform != "win32") {
        document.querySelector("#status").innerText = text("unable_launch_windows_app_on_other_platform");
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (!fs.existsSync(`dist/${name}.exe`)) {
        document.querySelector("#status").innerText = `${text("unable_to_find")} "dist/${name}.exe". ${text("did_you_compile_first")}`;
        document.querySelector("#status").style.color = "red";
        return;
      }
      child_process.spawn(`dist/${name}.exe`, {
        "detached": true
      });
      document.querySelector("#status").innerText = text("ready");
      document.querySelector("#status").style.color = "lime";
    } else if (config.target == "linux-app") {
      if (process.platform == "darwin") {
        document.querySelector("#status").innerText = text("unable_launch_linux_app_on_macos");
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (!fs.existsSync(`dist/${name}`)) {
        document.querySelector("#status").innerText = `${text("unable_to_find")} "dist/${name}". ${text("did_you_compile_first")}`;
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (process.platform == "win32") {
        child_process.spawn("C:\\Windows\\System32\\wsl.exe", [`dist/${name}`], {
          "detached": true
        });
      } else {
        child_process.spawn(`dist/${name}`, {
          "detached": true
        });
      }
      document.querySelector("#status").innerText = text("ready");
      document.querySelector("#status").style.color = "lime";
    } else if (config.target == "macos-app") {
      if (process.platform != "darwin") {
        document.querySelector("#status").innerText = text("unable_launch_macos_app_on_other_platform");
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (!fs.existsSync(`dist/${name}.app`)) {
        document.querySelector("#status").innerText = `${text("unable_to_find")} "dist/${name}.app". ${text("did_you_compile_first")}`;
        document.querySelector("#status").style.color = "red";
        return;
      }
      child_process.spawn("open", [`dist/${name}.app`], {
        "detached": true
      });
      document.querySelector("#status").innerText = text("ready");
      document.querySelector("#status").style.color = "lime";
    }
  };

  window.stop = () => {
    var src = path.join(process.cwd(), config.source);
    var system = {};
    try {
      system = JSON.parse(fs.readFileSync(path.join(src, "system.json")).toString("utf-8"));
    } catch {}
    var name = (system.name || "System");

    if (config.target == "windows-app") {
      if (process.platform != "win32") {
        document.querySelector("#status").innerText = text("unable_stop_windows_app_on_other_platform");
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (!fs.existsSync(`dist/${name}.exe`)) {
        document.querySelector("#status").innerText = `${text("unable_to_find")} "dist/${name}.exe". ${text("did_you_compile_first")}`;
        document.querySelector("#status").style.color = "red";
        return;
      }
      child_process.spawn("C:\\Windows\\System32\\taskkill.exe", ["/f", "/im", `${name}.exe`], {
        "detached": true
      });
      document.querySelector("#status").innerText = text("ready");
      document.querySelector("#status").style.color = "lime";
    } else if (config.target == "linux-app") {
      if (process.platform == "darwin") {
        document.querySelector("#status").innerText = text("unable_stop_linux_app_on_macos");
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (!fs.existsSync(`dist/${name}`)) {
        document.querySelector("#status").innerText = `${text("unable_to_find")} "dist/${name}". ${text("did_you_compile_first")}`;
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (process.platform == "win32") {
        child_process.spawn("C:\\Windows\\System32\\wsl.exe", ["killall", "-9", name], {
          "detached": true
        });
      } else {
        child_process.spawn("killall", ["-9", name], {
          "detached": true
        });
      }
      document.querySelector("#status").innerText = text("ready");
      document.querySelector("#status").style.color = "lime";
    } else if (config.target == "macos-app") {
      if (process.platform != "darwin") {
        document.querySelector("#status").innerText = text("unable_stop_macos_app_on_other_platform");
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (!fs.existsSync(`dist/${name}.app`)) {
        document.querySelector("#status").innerText = `${text("unable_to_find")} "dist/${name}.app". ${text("did_you_compile_first")}`;
        document.querySelector("#status").style.color = "red";
        return;
      }
      if (name.includes("'")) {
        document.querySelector("#status").innerText = text("system_name_unsafe");
        document.querySelector("#status").style.color = "red";
        return;
      }
      child_process.exec(`kill -9 $(ps -eo pid,command | grep 'dist/${name}.app/Contents/MacOS/nwjs' | grep -v grep | awk '{print $1}')`);
      document.querySelector("#status").innerText = text("ready");
      document.querySelector("#status").style.color = "lime";
    }
  };

  window.toggleLanguageSelect = () => {
    var langSelect = document.querySelector("#language-select");
    langSelect.style.display = (langSelect.style.display == "block" ? "none" : "block");
  };

  window.setLanguage = lang => {
    config.language = lang;
    fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
    openCompiler();
  };

  window.loadKernels = loadKernels;

  function openCompiler() {
    document.body.innerHTML = `
      <div id="titlebar">
        <p id="language" onclick="toggleLanguageSelect();">${(config.language || "en").toUpperCase()} <i class="fa-duotone fa-solid fa-caret-down"></i></p>
        <p id="minimize" onclick="nw.Window.get().minimize();">
          <i class="fa-sharp fa-solid fa-window-minimize"></i>
        </p>
        <p id="close" onclick="nw.Window.get().close(true);">
          <i class="fa-sharp fa-solid fa-xmark"></i>
        </p>
      </div>
      <div id="language-select" style="display: none;">
        ${supportedLanguages.map(lang => lang.at(-1)).map(lang => `<span onclick="setLanguage('${lang}');">${lang.toUpperCase()}</span>`).join("")}
      </div>
      <center>
        <br />
        <br />
        <a class="logo">
          <i class="fa-duotone fa-cat"></i> ${text("catcore_compiler")}
        </a>
        <br />
        <br />
        <br />
        <br />
        <div style="display: flex; justify-content: center; align-items: flex-end;">
          <div class="square">
            <br />
            <i class="fa-sharp fa-solid fa-gear-complex-code stepicon"></i>
            <br />
            ${text("compiler")}
            <br />
            <br />
            v${compiler.version}
            <i class="fa-sharp fa-solid fa-rotate update" onclick="updateCompiler();"></i>
            ${config.dev ? `<i class="fa-sharp fa-solid fa-wrench update" onclick="updateCompilerDev();"></i>` : ""}
          </div>

          <i class="fa-sharp fa-solid fa-arrow-right arrow"></i>

          <div class="square">
            <i class="fa-sharp fa-solid fa-microchip stepicon"></i>
            <br />
            ${text("kernel")}
            <br />
            <br />
            <select class="input" id="kernels">
              <option selected>${config.kernel}</option>
            </select>
            <i class="fa-sharp fa-solid fa-rotate update" onclick="loadKernels();"></i>
            <br />
            <br />
            <select class="input" id="arch">
              <option value="x64" selected>x64</option>
              <option value="arm64">ARM64</option>
            </select>
          </div>

          <i class="fa-sharp fa-solid fa-arrow-right arrow"></i>

          <div class="square">
            <br />
            <i class="fa-sharp fa-solid fa-code stepicon"></i>
            <br />
            ${text("system")}
            <br />
            <br />
            <input type="text" class="input" style="width: 110px;" autocomplete="off" value="src" id="source" required>
          </div>

          <i class="fa-sharp fa-solid fa-arrow-right arrow"></i>

          <div class="square">
            <i class="fa-sharp fa-box-circle-check stepicon"></i>
            <br />
            ${text("result")}
            <br />
            <br />
            <select class="input" id="target">
              <option value="web" disabled>${text("web")}</option>
              <option value="windows-app">${text("windows_app")}</option>
              <option value="linux-app">${text("linux_app")}</option>
              <option value="macos-app">${text("macos_app")}</option>
              <option value="iso" disabled>${text("bootable_iso")}</option>
              <option value="milkv-duos-sd" disabled>Milk-V Duo S (SD)</option>
              <option value="milkv-duos-emmc" disabled>Milk-V Duo S (EMMC)</option>
            </select>
            <br />
            <label><input type="checkbox" id="windowed"> ${text("windowed")}</label>
            <br />
            <label><input type="checkbox" id="quick" disabled> ${text("quick")}</label>
            ${config.dev ? `<br />
            <label><input type="checkbox" id="sdk"> SDK</label>` : ""}
          </div>
        </div>

        <p id="status" style="color: lime;">${text("ready")}</p>
        <a class="compile" onclick="compile();" id="compile">${text("compile")}</a> <i class="fa-sharp fa-solid fa-play extra" onclick="start();" style="background-color: #5fcf14;"></i> <i class="fa-sharp fa-solid fa-stop extra" onclick="stop();" style="background-color: #da1212;"></i>
      </center>
      <div id="modal-overlay" style="display: none;">
        <center>
          <br />
          <br />
          <br />
          <br />
          <br />
          <div id="modal">
            <br />
            <h3 id="modal-title"></h3>
            <br />
            <button class="compile" style="width: 100px; display: none;" id="modal-button" onclick="closeModal();"></button>
          </div>
        </center>
      </div>
    `;
    loadKernels();
    document.querySelector("#arch").value = config.arch;
    document.querySelector("#source").value = config.source;
    document.querySelector("#target").value = config.target;
    document.querySelector("#windowed").checked = config.windowed;

    // Disable quick mode when kernel/arch/target/sdk was changed
    function disableQuick() {
      document.querySelector("#quick").checked = false;
      document.querySelector("#quick").disabled = true;
    }
    document.querySelector("#kernels").addEventListener("change", disableQuick);
    document.querySelector("#arch").addEventListener("change", disableQuick);
    document.querySelector("#target").addEventListener("change", disableQuick);
    document.querySelector("#sdk").addEventListener("change", disableQuick);
  }

  window.addEventListener("DOMContentLoaded", openCompiler);
})();

