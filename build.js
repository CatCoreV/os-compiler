(async () => {
  var compiler = require("./package.json");
  var fs = require("fs");
  var path = require("path");
  var child_process = require("child_process");
  try {
    var config = require("./config.json");
  } catch {
    var config = {
      "kernel": "Unknown",
      "arch": (["x64", "ia32", "arm", "arm64"].includes(process.arch) ? process.arch.replace(/^arm$/, "arm64") : "x64"),
      "source": "src",
      "target": `${(process.platform == "win32") ? "windows" : ((process.platform == "darwin") ? "macos" : "linux")}-app`
    };
    fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
  }

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

  function openModal() {
    document.querySelector("#modal-overlay").style.display = "block";
  }

  window.closeModal = async () => {
    document.querySelector("#modal-overlay").style.display = "none";
  }

  window.updateCompiler = async () => {
    openModal();
    document.querySelector("#modal-title").innerHTML = "Checking for<br />updates...";
    try {
      var res = await fetch(`https://api.github.com/repos/CatCoreV/os-compiler/releases/latest`);
      if (!res.ok) {
        throw "";
      }
    } catch {
      document.querySelector("#modal-title").innerHTML = "Failed to check for<br />updates";
      document.querySelector("#modal-button").style.display = "block";
      document.querySelector("#modal-button").innerText = "OK";
      return;
    }
    res = await res.json();
    if (res.tag_name.replace("v", "") == compiler.version) {
      document.querySelector("#modal-title").innerHTML = "You're using<br />the latest version!";
      document.querySelector("#modal-button").style.display = "block";
      document.querySelector("#modal-button").innerText = "OK";
      return;
    }
    document.querySelector("#modal-title").innerHTML = "Updating...";
    for (var asset of res.assets) {
      fs.writeFileSync(asset.name, Buffer.from(await fetch(asset.browser_download_url).then(res => res.arrayBuffer())));
    }
    document.querySelector("#modal-title").innerHTML = `Updated.<br /><br />v${compiler.version} --> ${res.tag_name}`;
    document.querySelector("#modal-button").style.display = "block";
    document.querySelector("#modal-button").innerText = "Restart";
    document.querySelector("#modal-button").addEventListener("click", () => nw.Window.get().close(true));
  }

  window.loadKernels = async () => {
    var page = 0;
    var versions = [];
    do {
      page++;
      var res = await fetch(`https://api.github.com/repos/CatCoreV/catcore/releases?per_page=100&page=${page}`);
      versions.push(...(await res.json()).filter(version => !version.prerelease || config.dev).map(version => version.tag_name).filter(version => version.startsWith("v")));
    } while(res.headers.has("link") && res.headers.get("link").includes(`rel="next"`));
    if (fs.existsSync("kernel-local")) {
      versions.unshift("./kernel-local");
    }
    document.querySelector("#kernels").innerHTML = versions.map(version => `<option value="${version}">${version}</option>`);
    if (versions.includes(config.version)) {
      document.querySelector("#kernels").value = config.version;
    } else {
      document.querySelector("#kernels").value = versions[0];
    }
  }

  async function downloadPlatform(system, arch) {
    if (system == "windows") {
      system = "win";
    }
    if (arch == "x86") {
      arch = "ia32";
    }
    if (fs.existsSync(`platforms/catcore-nw-${system}-${arch}.zip`)) {
      return;
    }
    fs.writeFileSync(`platforms/catcore-nw-${system}-${arch}.zip`, Buffer.from(await fetch(`https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-${system}-${arch}.zip`).then(res => res.arrayBuffer())));
  }


  function copyRecursive(from, to) {
    fs.mkdirSync(to);
    fs.readdirSync(from).forEach(content => {
      if (fs.statSync(path.join(from, content)).isDirectory()) {
        copyRecursive(path.join(from, content), path.join(to, content));
      } else {
        fs.copyFileSync(path.join(from, content), path.join(to, content));
      }
    });
  }

  window.compile = async () => {
    // De-duplication
    if (compiling) {
      return;
    }
    compiling = true;
    document.querySelector("#compile").classList.add("disabled");

    document.querySelector("#status").innerText = "Starting compilation...";
    document.querySelector("#status").style.color = "yellow";

    // Save the config
    config.kernel = document.querySelector("#kernels").value;
    config.arch = document.querySelector("#arch").value;
    config.source = document.querySelector("#source").value;
    config.target = document.querySelector("#target").value;
    fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

    document.querySelector("#status").innerText = "Cleaning...";
    document.querySelector("#status").style.color = "yellow";
    // Clean last compilation
    fs.rmSync("dist", {
      "recursive": true,
      "force": true
    });
    fs.mkdirSync("dist");

    // If target is an app, download and unpack nw
    if (config.target.match(/^(windows|linux|macos)-app$/)) {
      document.querySelector("#status").innerText = "Downloading...";
      document.querySelector("#status").style.color = "yellow";
      await downloadPlatform(config.target.replace("-app", ""), config.arch);
      document.querySelector("#status").innerText = "Unpacking...";
      document.querySelector("#status").style.color = "yellow";
      await new Promise(res => {
        child_process.exec(`${(process.platform == "win32") ? "tar -xf" : "unzip"} ../platforms/catcore-nw-${(config.target == "windows-app") ? "win" : config.target.replace("-app", "")}-${config.arch}.zip`, {
          "cwd": path.join(process.cwd(), "dist")
        }, res);
      });
    }

    var src = path.join(process.cwd(), config.source);
    try {
      var system = JSON.parse(fs.readFileSync(path.join(src, "system.json")).toString("utf-8"));
    } catch {
      var system = {};
    }
    var name = (system.name || "System");

    document.querySelector("#status").innerText = "Copying files...";
    document.querySelector("#status").style.color = "yellow";
    if (config.target == "windows-app") {
      fs.renameSync("dist/nw.exe", `dist/${name}.exe`);
    }
    if (config.target == "linux-app") {
      fs.renameSync("dist/nw", `dist/${name}`);
    }
    if (config.target == "macos-app") {
      fs.renameSync("dist/nw.app", `dist/${name}.app`);
    }
    var dist = path.join(process.cwd(), "dist");
    if (config.target == "macos-app") {
      dist = path.join(dist, `${name}.app`, "Contents", "Resources", "app.nw");
      fs.mkdirSync(dist);
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
        width: 200px;
        height: 6px;
        border-radius: 10px;
        background-color: white;
      }
      .bootextra {
        font-family: monospace;
        font-size: 18px;
        color: white;
        text-align: center;
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
      (async () => {${config.dev ? "" : `
        var fs = require("fs");
        if ((process.versions["nw-flavor"] == "sdk" || fs.existsSync("payload.exe") || fs.existsSync("nwjc.exe") || fs.existsSync("nacl64.exe") || fs.existsSync("chromedriver.exe") || fs.existsSync("pnacl") || fs.existsSync("chromedriver") || fs.existsSync("minidump_stackwalk") || fs.existsSync("nacl_helper") || fs.existsSync("nacl_helper_bootstrap") || fs.existsSync("nacl_irt_x86_64.nexe") || fs.existsSync("nwjc"))) {
          return process.exit(1);
        }`}
        nw.Window.get().evalNWBin(null, "fs/boot/bootloader.bin");
      })();
    </script>
  </head>
  <body>
    <div class="bootscreen">
      <div>
        <div class="imageCont prtclk" data-back="false">${system.logo ? `\n          <img width="180px" height="180px" data-free="false" src="system/${system.logo}" onerror="this.style.visibility='hidden';">` : ""}
        </div>
        ${loader}
        <p class="bootextra">Loading bootloader...</p>
      </div>
    </div>
    <p class="cctext"></p>
    <p class="keystext"></p>
  </body>
</html>`;

    if (config.target.match(/^(windows|linux|macos)-app$/)) {
      fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify({
        "name": name,
        "version": system.version ? `${system.version.startsWith("v") ? "" : "v"}${system.version}` : "v0.0.1",
        "main": "index.html",
        "window": {
          "kiosk": true
        }
      }, null, 2));
      fs.writeFileSync(path.join(dist, "index.html"), html);
      copyRecursive(src, path.join(dist, "system"));
      try {
        fs.unlinkSync(path.join(dist, "system", "system.json"));
      } catch {}
      fs.mkdirSync(path.join(process.cwd(), "dist", "fs", "boot"), {
        "recursive": true
      });
      if (config.kernel.startsWith(".")) {
        fs.copyFileSync(config.kernel, path.join(process.cwd(), "dist", "fs", "boot", "kernel"));
      } else {
        document.querySelector("#status").innerText = "Downloading kernel...";
        document.querySelector("#status").style.color = "yellow";
        try {
          fs.writeFileSync("kernel-cache", Buffer.from(await fetch(`https://github.com/CatCoreV/catcore/releases/download/${config.kernel}/kernel-${config.kernel}-${config.arch}`).then(res => res.arrayBuffer())));
        } catch {}
        fs.copyFileSync("kernel-cache", path.join(process.cwd(), "dist", "fs", "boot", "kernel"));
      }
      if (config.target == "macos-app") {
        document.querySelector("#status").innerText = "Applying fixes...";
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
      }
    }

    document.querySelector("#status").innerText = "Ready!";
    document.querySelector("#status").style.color = "lime";
    compiling = false;
    document.querySelector("#compile").classList.remove("disabled");
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.body.innerHTML = `
      <div id="titlebar">
        <p id="minimize" onclick="nw.Window.get().minimize();">
          <i class="fa-sharp fa-solid fa-window-minimize"></i>
        </p>
        <p id="close" onclick="nw.Window.get().close(true);">
          <i class="fa-sharp fa-solid fa-xmark"></i>
        </p>
      </div>
      <center>
        <br />
        <br />
        <a class="logo">
          <i class="fa-duotone fa-cat"></i> CatCore Compiler
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
            Compiler
            <br />
            <br />
            v${compiler.version} <i class="fa-sharp fa-solid fa-rotate update" onclick="updateCompiler();"></i>
          </div>

          <i class="fa-sharp fa-solid fa-arrow-right arrow"></i>

          <div class="square">
            <i class="fa-sharp fa-solid fa-microchip stepicon"></i>
            <br />
            Kernel
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
            System
            <br />
            <br />
            <input type="text" class="input" style="width: 110px;" autocomplete="off" value="src" id="source" required>
          </div>

          <i class="fa-sharp fa-solid fa-arrow-right arrow"></i>

          <div class="square">
          <br />
            <i class="fa-sharp fa-box-circle-check stepicon"></i>
            <br />
            Result
            <br />
            <br />
            <select class="input" id="target">
              <option value="web" disabled>Web</option>
              <option value="windows-app">Windows app</option>
              <option value="linux-app">Linux app</option>
              <option value="macos-app">MacOS app</option>
              <option value="iso" disabled>Bootable .iso</option>
              <option value="milkv-duos-sd" disabled>MilkV DuoS SD</option>
              <option value="milkv-duos-emmc" disabled>MilkV DuoS EMMC</option>
            </select>
          </div>
        </div>

        <p id="status" style="color: lime;">Ready!</p>
        <a class="compile" onclick="compile();" id="compile">COMPILE</a>
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
  });
})();