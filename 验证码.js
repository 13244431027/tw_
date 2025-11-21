// 名称: 验证码
// ID: SPcaptcha
// 描述: 用于检查用户是否为人类的验证码
// 作者: SharkPool

// 版本 V.1.0.2

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("验证码扩展必须在非沙盒环境中运行!");

  const menuIconURI =
"data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMzUuMTM4NjUiIGhlaWdodD0iMTM1LjEzODY1IiB2aWV3Qm94PSIwLDAsMTM1LjEzODY1LDEzNS4xMzg2NSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE3Mi40MzA2NywtMTEyLjQzMDY3KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMTc1LjkzMDY3LDE4MGMwLC0zNS4zODQ1MSAyOC42ODQ4MSwtNjQuMDY5MzMgNjQuMDY5MzMsLTY0LjA2OTMzYzM1LjM4NDUxLDAgNjQuMDY5MzMsMjguNjg0ODEgNjQuMDY5MzMsNjQuMDY5MzNjMCwzNS4zODQ1MSAtMjguNjg0ODEsNjQuMDY5MzMgLTY0LjA2OTMzLDY0LjA2OTMzYy0zNS4zODQ1MSwwIC02NC4wNjkzMywtMjguNjg0ODEgLTY0LjA2OTMzLC02NC4wNjkzM3oiIGZpbGw9IiM2MDZlOTAiIHN0cm9rZT0iIzMzM2E0ZCIgc3Ryb2tlLXdpZHRoPSI3Ii8+PHBhdGggZD0iTTI4MS45OTg1NSwxNzkuOTM4NThjLTYuNDE0LC0wLjA5MyAtMjIuMDE1LC0wLjA2MTIgLTM1LjgyNSwtMC4wMDdsMTAuOTAzLC0xMC45MDNjLTMuMzMzLC01LjIzMDkgLTguOTkzNiwtOC44MzQ4NyAtMTUuNTI0LC05LjM1MDNjLTAuMzYxMSwtMC4xNDAxOCAtMC44NTI1NiwtMC4yMTQ1OCAtMS40ODkzLC0wLjIxNDU4Yy01LjI3MDcsMCAtOS4wODA5LDEuNzE1OCAtMTEuNzcwMSwzLjgxNDNjLTIuNTg1NiwxLjgxMSAtNC43Myw0LjIwODggLTYuMjM5NSw3LjAwMDVsLTE1LjQwMywtMTUuNTY1YzcuNjU5LC0xMC4wODEzIDE5Ljc3NSwtMTYuNTkxIDMzLjQxMywtMTYuNTkxYzEzLjEwNSwwIDI0LjgwNSw2LjAxMjkgMzIuNDk2LDE1LjQyN2w5LjM5NzEsLTkuMzk3MXYzMy45OTFjMC4wMjcsMC41OTYyIDAuMDQwOSwxLjE5NTI4IDAuMDQyOSwxLjc5NzYiIGZpbGw9IiMxYzNhYTkiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTIzOS44MTYzMywxMzguMTI1MmMtMC4wOTMxLDYuNDE0IC0wLjA2MTIsMjIuMDE1IC0wLjAwNywzNS44MjVsLTEwLjkwMywtMTAuOTAzYy01LjIzMDksMy4zMzMgLTguODM0ODcsOC45OTM2IC05LjM1MDMsMTUuNTI0Yy0wLjE0MDE4LDAuMzYxMSAtMC4yMTQ1OCwwLjg1MjU2IC0wLjIxNDU4LDEuNDg5M2MwLDUuMjcwNyAxLjcxNTksOS4wODA5IDMuODE0MywxMS43N2MxLjgxMSwyLjU4NTYgNC4yMDg4LDQuNzMgNy4wMDA1LDYuMjM5NWwtMTUuNTY1LDE1LjQwM2MtMTAuMDgxMiwtNy42NTkgLTE2LjU5MSwtMTkuNzc1IC0xNi41OTEsLTMzLjQxM2MwLC0xMy4xMDUgNi4wMTI5LC0yNC44MDUgMTUuNDI3LC0zMi40OTZsLTkuMzk3MSwtOS4zOTcxaDMzLjk5MWMwLjU5NjIsLTAuMDI3IDEuMTk1MjgsLTAuMDQwOSAxLjc5NzYsLTAuMDQyOSIgZmlsbD0iIzQyODVmNCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNMTk4LjAwMjk1LDE4MC4wNjE0MmM2LjQxNCwwLjA5MyAyMi4wMTUsMC4wNjEyIDM1LjgyNSwwLjAwN2wtMTAuOTAzLDEwLjkwM2MzLjMzMyw1LjIzMDkgOC45OTM2LDguODM0ODcgMTUuNTI0LDkuMzUwM2MwLjM2MTEsMC4xNDAxOCAwLjg1MjU2LDAuMjE0NTggMS40ODkzLDAuMjE0NThjNS4yNzA3LDAgOS4wODA5LC0xLjcxNTggMTEuNzcsLTMuODE0M2MyLjU4NTYsLTEuODExIDQuNzMsLTQuMjA4OCA2LjIzOTUsLTcuMDAwNWwxNS40MDMsMTUuNTY1Yy03LjY1OSwxMC4wODEzIC0xOS43NzUsMTYuNTkxIC0zMy40MTMsMTYuNTkxYy0xMy4xMDUsMCAtMjQuODA1LC02LjAxMjkgLTMyLjQ5NiwtMTUuNDI3bC05LjM5NzEsOS4zOTcxdS0zMy45OTFjLTAuMDI3LC0wLjU5NjIgLTAuMDQwOSwtMS4xOTUyOCAtMC4wNDI5LC0xLjc5NzYiIGZpbGw9IiNhYmFiYWIiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvZz48L3N2Zz4=";

  const blockIconURI =
"data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMTcuNTE0MDkiIGhlaWdodD0iMTE3LjUxNDA5IiB2aWV3Qm94PSIwLDAsMTE3LjUxNDA5LDExNy41MTQwOSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE4MS4yNDI5NSwtMTIxLjI0Mjk1KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLWRhc2hhcnJheT0iIiBzdHJva2UtZGFzaG9mZnNldD0iMCIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0xODEuMjQyOTUsMjM4Ljc1NzA1di0xMTcuNTE0MDloMTE3LjUxNDA5djExNy41MTQwOXoiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIvPjxwYXRoIGQ9Ik0yODEuOTk4NTUsMTc5LjkzODU4Yy02LjQxNCwtMC4wOTMgLTIyLjAxNSwtMC4wNjEyIC0zNS44MjUsLTAuMDA3bDEwLjkwMywtMTAuOTAzYy0zLjMzMywtNS4yMzA5IC04Ljk5MzYsLTguODM0ODcgLTE1LjUyNCwtOS4zNTAzYy0wLjM2MTEsLTAuMTQwMTggLTAuODUyNTYsLTAuMjE0NTggLTEuNDg5MywtMC4yMTQ1OGMtNS4yNzA3LDAgLTkuMDgwOSwxLjcxNTggLTExLjc3LDMuODE0M2MtMi41ODU2LDEuODExIC00LjczLDQuMjA4OCAtNi4yMzk1LDcuMDAwNWwtMTUuNDAzLC0xNS41NjVjNy42NTksLTEwLjA4MTMgMTkuNzc1LC0xNi41OTEgMzMuNDEzLC0xNi41OTFjMTMuMTA1LDAgMjQuODA1LDYuMDEyOSAzMi40OTYsMTUuNDI3bDkuMzk3MSwtOS4zOTcxdjMzLjk5MWMwLjAyNywwLjU5NjIgMC4wNDA5LDEuMTk1MjggMC4wNDI5LDEuNzk3NiIgZmlsbD0iIzFjM2FhOSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTIzOS44MTYzMywxMzguMTI1MmMtMC4wOTMxLDYuNDE0IC0wLjA2MTIsMjIuMDE1IC0wLjAwNywzNS44MjVsLTEwLjkwMywtMTAuOTAzYy01LjIzMDksMy4zMzMgLTguODM0ODcsOC45OTM2IC05LjM1MDMsMTUuNTI0Yy0wLjE0MDE4LDAuMzYxMSAtMC4yMTQ1OCwwLjg1MjU2IC0wLjIxNDU4LDEuNDg5M2MwLDUuMjcwNyAxLjcxNTksOS4wODA5IDMuODE0MywxMS43N2MxLjgxMSwyLjU4NTYgNC4yMDg4LDQuNzMgNy4wMDA1LDYuMjM5NWwtMTUuNTY1LDE1LjQwM2MtMTAuMDgxMiwtNy42NTkgLTE2LjU5MSwtMTkuNzc1IC0xNi41OTEsLTMzLjQxM2MwLC0xMy4xMDUgNi4wMTI5LC0yNC44MDUgMTUuNDI3LC0zMi40OTZsLTkuMzk3MSwtOS4zOTcxaDMzLjk5MWMwLjU5NjIsLTAuMDI3IDEuMTk1MjgsLTAuMDQwOSAxLjc5NzYsLTAuMDQyOSIgZmlsbD0iIzQyODVmNCIgc3Ryb2tlLXdpZHRoPSIxIiLz48cGF0aCBkPSJNMTk4LjAwMjk1LDE4MC4wNjE0MmM2LjQxNCwwLjA5MyAyMi4wMTUsMC4wNjEyIDM1LjgyNSwwLjAwN2wtMTAuOTAzLDEwLjkwM2MzLjMzMyw1LjIzMDkgOC45OTM2LDguODM0ODcgMTUuNTI0LDkuMzUwM2MwLjM2MTEsMC4xNDAxOCAwLjg1MjU2LDAuMjE0NTggMS40ODkzLDAuMjE0NThjNS4yNzA3LDAgOS4wODA5LC0xLjcxNTggMTEuNzcsLTMuODE0M2MyLjU4NTYsLTEuODExIDQuNzMsLTQuMjA4OCA2LjIzOTUsLTcuMDAwNWwxNS40MDMsMTUuNTY1Yy03LjY1OSwxMC4wODEzIC0xOS43NzUsMTYuNTkxIC0zMy40MTMsMTYuNTkxYy0xMy4xMDUsMCAtMjQuODA1LC02LjAxMjkgLTMyLjQ5NiwtMTUuNDI3bC05LjM5NzEsOS4zOTcxdS0zMy45OTFjLTAuMDI3LC0wLjU5NjIgLTAuMDQwOSwtMS4xOTUyOCAtMC4wNDI5LC0xLjc5NzYiIGZpbGw9IiNhYmFiYWIiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L2c+PC9zdmc+";

  const vm = Scratch.vm;
  const render = vm.renderer;

  const fontMenu = [
    "无衬线体", "衬线体", "手写体",
    "马克笔体", "花体", "像素体"
  ];

  const allElements = [
    "图片边框", "图片背景",
    "输入框边框", "输入框背景", "输入框文字",
    "按钮边框", "按钮背景(悬停)", "按钮背景(正常)", "按钮文字"
  ];

  const xmlEscape = function (unsafe) {
    unsafe = String(unsafe);
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case "\"": return "&quot;";
      }
    });
  };

  // 安全相关
  let internalUserPass, internalUserAnswer, internalAnswer;

  let currentCaptcha = null;
  let captchaInfo = {
    passed: false, difficulty: "easy",
    answer: "", userAnswer: "",
    lastImg: ""
  };
  let visSetting = {
    // 功能
    autoClose: true, focusMode: true,

    // 视觉
    font: "继承",
    "图片边框" : "#cccccc", "图片背景" : "#000000",
    "输入框边框" : "#cccccc", "输入框背景" : "linear-gradient(#ffffff, #b3b3b3)", "输入框文字" : "#000000",
    "按钮边框" : "#cccccc", "按钮文字" : "#000000",
    "按钮背景(悬停)" : "linear-gradient(#b3b3b3, #ffffff)", "按钮背景(正常)" : "linear-gradient(#ffffff, #b3b3b3)",

    // 效果: 第0项: 值, 第1项: HTML单位
    blur: [0, "px"], brightness: [0, ""],
    contrast: [0, ""], "hue-rotate": [0, "deg"],
    invert: [0, ""], opacity: [0, ""],
    saturate: [100, ""], sepia: [0, ""],
    scale: [100, "", 100, ""],  rotate: [90, "deg"],
    skewX: [0, "deg"], skewY: [0, "deg"]
  };

  function generateCaptchaText(DIFF) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captchaText = "";
    for (let i = 0; i < 4 + ((DIFF - 1) * 2); i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captchaText;
  }

  function randomHex(DIFF) {
    const rngCom = () => Math.floor(Math.random() * 256);
    let darkAmt = 35 * (DIFF - 1);
    const color = { r: rngCom(), g: rngCom(), b: rngCom() };
    if (color.r < 80 && color.g < 80 && color.b < 80) darkAmt += 80;
    color.r = Math.max(50, color.r - darkAmt);
    color.g = Math.max(50, color.g - darkAmt);
    color.b = Math.max(50, color.b - darkAmt);
    return RGBA2hex(color);
  }
  function RGBA2hex(rgb) {
    const alphaHex = rgb.a !== undefined ? Math.round(rgb.a).toString(16).padStart(2, '0') : '';
    return `#${(1 << 24 | rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).slice(1)}${alphaHex}`;
  }

  function drawCaptcha() {
    captchaInfo.userAnswer = "";
    // 易于阅读/区分的字体
    const fonts = [
      "Arial", "Helvetica", "Verdana",
      "Georgia", "Palatino", "Comic Sans MS", "Arial Black", "Impact",
      "无衬线体", "衬线体", "手写体", "马克笔体", "花体", "像素体"
    ];

    const container = document.createElement("div");
    container.style.cssText = `width: 100%; height: 100%; background-color: rgba(0, 0, 0, ${visSetting.focusMode ? 0.5 : 0});`;
    container.id = "SPcaptchaBox";
    container.style.position = "fixed";
    container.style.transform = "translate(-50%, -50%)";
    container.style.pointerEvents = "auto";
    container.style.fontFamily = visSetting.font;

    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    const capTxt = generateCaptchaText(captchaInfo.difficulty);

    // 绘制线条
    for (let l = 0; l < captchaInfo.difficulty * 3; l++) {
      ctx.strokeStyle = randomHex(6 - captchaInfo.difficulty);
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // 绘制字母
    const startX = 100 - (capTxt.length * 10);
    const startY = canvas.height / 2;
    const spacing = (80 - (capTxt.length * 5)) / 2;
    for (let i = 0; i < capTxt.length; i++) {
      const convertDiff = captchaInfo.difficulty * 20;
      const xPos = startX + i * spacing + Math.random() * 10 - 5;
      const yPos = startY + Math.random() * convertDiff - (convertDiff / 2);
    
      const fontSize = Math.floor(Math.random() * 20) + 20;
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      ctx.font = `${fontSize}px ${font}`;
      ctx.fillStyle = randomHex(captchaInfo.difficulty);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(xPos, yPos);
      const diffRange = { 1: Math.PI / 8, 2: Math.PI / 6, 3: Math.PI / 5 };
      const rotRange = diffRange[captchaInfo.difficulty];
      ctx.rotate(Math.random() * rotRange * 2 - rotRange);
      ctx.fillText(capTxt[i], 0, 0);
      ctx.restore();
    }

    const imgContain = document.createElement("div");
    imgContain.style.position = "absolute";
    imgContain.style.top = "40%";
    imgContain.style.left = "50%";
    imgContain.style.transform = "translate(-50%, -60%)";
    imgContain.style.backgroundColor = visSetting["图片背景"];
    imgContain.style.zIndex = "3";
    imgContain.style.border = `5px solid ${visSetting["图片边框"]}`;
    imgContain.style.borderRadius = "15px";

    const captchaImage = document.createElement("img");
    const captchaURI = canvas.toDataURL();
    captchaInfo.lastImg = captchaURI;
    captchaImage.src = captchaURI;
    captchaImage.style.userDrag = "none";
    captchaImage.style.webkitUserDrag = "none";
    captchaImage.style.userSelect = "none";
    captchaImage.style.mozUserSelect = "none";
    captchaImage.style.webkitUserSelect = "none";
    captchaImage.style.msUserSelect = "none";
    imgContain.appendChild(captchaImage);
    container.appendChild(imgContain);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "输入验证码";
    input.style.position = "absolute";
    input.style.top = "60%";
    input.style.left = "50%";
    input.style.transform = "translate(-50%, -50%)";
    input.style.width = "200px";
    input.style.zIndex = "2";
    input.style.textAlign = "center";
    input.style.borderRadius = "10px";
    input.style.padding = "5px 15px";
    input.style.border = `5px solid ${visSetting["输入框边框"]}`;
    input.style.background = visSetting["输入框背景"];
    input.style.color = visSetting["输入框文字"];
    container.appendChild(input);

    const submitButton = document.createElement("button");
    submitButton.textContent = "提交";
    submitButton.style.position = "absolute";
    submitButton.style.top = "70%";
    submitButton.style.left = "50%";
    submitButton.style.transform = "translate(-50%, -20%)";
    submitButton.style.background = visSetting["按钮背景(正常)"];
    submitButton.style.border = `5px solid ${visSetting["按钮边框"]}`;
    submitButton.style.zIndex = "2";
    submitButton.style.borderRadius = "10px";
    submitButton.style.padding = "5px 15px";
    submitButton.style.fontWeight = "600";
    submitButton.style.color = visSetting["按钮文字"];
    container.appendChild(submitButton);
  
    function handleSubmit() {
      container.style.pointerEvents = "none";
      captchaInfo.userAnswer = input.value;
      captchaInfo.passed = input.value === capTxt;
      if (visSetting.autoClose) {
        render.removeOverlay(container);
        captchaInfo.answer = capTxt;
        currentCaptcha = null;
      }
      vm.runtime.startHats("SPcaptcha_whenAnswered");
    }
    submitButton.addEventListener("click", handleSubmit);
    submitButton.addEventListener("mouseenter", function() { submitButton.style.background = visSetting["按钮背景(悬停)"] });
    submitButton.addEventListener("mouseleave", function() { submitButton.style.background = visSetting["按钮背景(正常)"] });
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    });
    render.addOverlay(container, "scale-centered");
    input.focus();
    currentCaptcha = container;
  }

  class SPcaptcha {
    constructor() {
      vm.runtime.on("PROJECT_START", () => { this.closeCaptcha() });
      vm.runtime.on("PROJECT_STOP_ALL", () => { this.closeCaptcha() });

      // 防止用户自动通过验证码的辅助函数
      vm.runtime.on("BEFORE_EXECUTE", () => {
        // 目前我只是重置函数，也许我们可以停止项目，但无论如何
        const openUserPass = vm.runtime._primitives.SPcaptcha_userPassed.toString();
        if (internalUserPass && openUserPass !== internalUserPass.toString()) {
          vm.runtime._primitives.SPcaptcha_userPassed = eval(internalUserPass.toString());
        }

        const openAnswer = vm.runtime._primitives.SPcaptcha_getAnswer.toString();
        if (internalAnswer && openAnswer !== internalAnswer.toString()) {
          vm.runtime._primitives.SPcaptcha_getAnswer = eval(internalAnswer.toString());
        }

        const openUserAnswer = vm.runtime._primitives.SPcaptcha_getResponse.toString();
        if (internalUserAnswer && openUserAnswer !== internalUserAnswer.toString()) {
          vm.runtime._primitives.SPcaptcha_getResponse = eval(internalUserAnswer.toString());
        }
      });
    }
    getInfo() {
      return {
        id: "SPcaptcha",
        name: "验证码",
        color1: "#606E90",
        menuIconURI,
        blockIconURI,
        blocks: [
          {
            opcode: "openCaptcha",
            blockType: Scratch.BlockType.COMMAND,
            text: "打开 [DIFF] 验证码",
            arguments: {
              DIFF: { type: Scratch.ArgumentType.STRING, menu: "DIFFICULTY" }
            },
          },
          {
            opcode: "openCaptchaWait",
            blockType: Scratch.BlockType.COMMAND,
            text: "打开 [DIFF] 验证码并等待",
            arguments: {
              DIFF: { type: Scratch.ArgumentType.STRING, menu: "DIFFICULTY" }
            },
          },
          {
            opcode: "closeCaptcha",
            blockType: Scratch.BlockType.COMMAND,
            text: "关闭验证码"
          },
          {
            opcode: "whenAnswered",
            blockType: Scratch.BlockType.EVENT,
            isEdgeActivated: false,
            text: "当验证码被回答时"
          },
          {
            opcode: "captchaOpen",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "验证码是否打开?"
          },
          "---",
          {
            opcode: "userPassed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "最后一个验证码通过了吗?"
          },
          {
            opcode: "getAnswer",
            blockType: Scratch.BlockType.REPORTER,
            text: "最后一个验证码答案"
          },
          {
            opcode: "getResponse",
            blockType: Scratch.BlockType.REPORTER,
            text: "最后提交的答案"
          },
          {
            opcode: "getDiff",
            blockType: Scratch.BlockType.REPORTER,
            text: "当前验证码难度"
          },
          {
            opcode: "lastImage",
            blockType: Scratch.BlockType.REPORTER,
            text: "最后一个验证码图片"
          },
          { blockType: Scratch.BlockType.LABEL, text: "视觉和颜色" },
          {
            opcode: "toggleFunction",
            blockType: Scratch.BlockType.COMMAND,
            text: "切换 [FUNC] [SETTING]",
            arguments: {
              FUNC: { type: Scratch.ArgumentType.STRING, menu: "FUNCTIONS" },
              SETTING: { type: Scratch.ArgumentType.STRING, menu: "TOGGLE" }
            },
          },
          "---",
          {
            opcode: "resetColors",
            blockType: Scratch.BlockType.COMMAND,
            text: "重置验证码视觉"
          },
          {
            opcode: "setFont",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置验证码字体为 [FONT]",
            arguments: {
              FONT: { type: Scratch.ArgumentType.STRING, menu: "FONTS" }
            },
          },
          {
            opcode: "setColor",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置 [THING] 为 [COLOR]",
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "ELEMENTS" },
              COLOR: { type: Scratch.ArgumentType.COLOR }
            },
          },
          "---",
          {
            opcode: "resetEffect",
            blockType: Scratch.BlockType.COMMAND,
            text: "重置验证码效果"
          },
          {
            opcode: "setEffect",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置验证码的 [EFFECT] 为 [VALUE]",
            arguments: {
              VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              EFFECT: { type: Scratch.ArgumentType.STRING, menu: "EFFECTS" }
            },
          },
          {
            opcode: "getEffect",
            blockType: Scratch.BlockType.REPORTER,
            text: "当前 [EFFECT]",
            arguments: {
              EFFECT: { type: Scratch.ArgumentType.STRING, menu: "EFFECTS" }
            },
          },
        ],
        menus: {
          FONTS: {
            acceptReporters: true,
            items: "allFonts"
          },
          DIFFICULTY: {
            acceptReporters: true,
            items: ["简单", "中等", "困难"]
          },
          TOGGLE: {
            acceptReporters: true,
            items: ["开启", "关闭"]
          },
          FUNCTIONS: {
            acceptReporters: true,
            items: ["聚焦模式", "自动关闭"]
          },
          ELEMENTS: {
            acceptReporters: true,
            items: allElements
          },
          EFFECTS: {
            acceptReporters: true,
            items: [
              "模糊", "饱和度", "对比度", "亮度",
              "色相", "不透明度", "复古", "反色", "方向",
              "缩放 X", "缩放 Y", "倾斜 X", "倾斜 Y"
            ]
          }
        }
      };
    }

    allFonts() {
      const customFonts = Scratch.vm.runtime.fontManager ? Scratch.vm.runtime.fontManager.getFonts().map((i) => ({ text: i.name, value: i.family })) : [];
      return [...fontMenu, ...customFonts];
    }

    openCaptcha(args, util) {
      // 移除任何现有的验证码
      render.removeOverlay(currentCaptcha);
      currentCaptcha = "pending"; // 立即执行此操作以让出块
      captchaInfo.difficulty = args.DIFF === "简单" ? 1 : args.DIFF === "中等" ? 2 : 3;
      drawCaptcha();
    }

    openCaptchaWait(args, util) {
      if (typeof util.stackFrame.captchaWait === "undefined") {
        // 移除任何现有的验证码
        render.removeOverlay(currentCaptcha);
        util.stackFrame.captchaWait = true;
        currentCaptcha = "pending"; // 立即执行此操作以让出块
        captchaInfo.difficulty = args.DIFF === "简单" ? 1 : args.DIFF === "中等" ? 2 : 3;
        drawCaptcha();
      }
      if (currentCaptcha) util.yield();
    }

    closeCaptcha() {
      captchaInfo = { ...captchaInfo, passed: false };
      render.removeOverlay(currentCaptcha);
      currentCaptcha = null;
    }

    userPassed() { return captchaInfo.passed }
    getAnswer() { return captchaInfo.answer }
    getResponse() { return captchaInfo.userAnswer }
    getDiff() {
      const diff = captchaInfo.difficulty;
      return diff === 1 ? "简单" : diff === 2 ? "中等" : "困难";
    }
    captchaOpen() { return Scratch.Cast.toBoolean(currentCaptcha) }
    lastImage() { return captchaInfo.lastImg }

    toggleFunction(args) {
      const con = args.SETTING === "开启";
      switch (args.FUNC) {
        case "聚焦模式": { visSetting.focusMode = con; break }
        case "自动关闭": { visSetting.autoClose = con; break }
        default: /* 可能稍后会添加更多 */ break;
      }
      if (currentCaptcha) this.updateCaptchaHtml();
    }

    resetEffect(args) {
      visSetting = {
        ...visSetting,
        blur: [0, "px"], brightness: [0, ""],
        contrast: [0, ""], "hue-rotate": [0, "deg"],
        invert: [0, ""], opacity: [0, ""],
        saturate: [100, ""], sepia: [0, ""],
        scale: [100, "", 100, ""],  rotate: [90, "deg"],
        skewX: [0, "deg"], skewY: [0, "deg"]
      };
      if (!currentCaptcha) return;
      currentCaptcha.style.transform = this.callVisUpdate("transform");
      currentCaptcha.style.filter = this.callVisUpdate("filter");
    }

    setEffect(args) {
      if (!currentCaptcha) return;
      let effect = args.EFFECT;
      if (effect === "方向") effect = "rotate";
      if (effect === "饱和度") effect = "saturate";
      if (effect === "倾斜 X") effect = "skewX";
      if (effect === "倾斜 Y") effect = "skewY";
      if (effect.startsWith("缩放")) effect = "scale";
      const key = visSetting[effect];
      if (key !== undefined) {
        key[args.EFFECT === "缩放 Y" ? 2 : 0] = Scratch.Cast.toNumber(args.VALUE)
        currentCaptcha.style.transform = this.callVisUpdate("transform");
        currentCaptcha.style.filter = this.callVisUpdate("filter");
      }
    }

    resetColors(args) {
      visSetting = {
        ...visSetting,
        "图片边框" : "#cccccc", "图片背景" : "#000000",
        "输入框边框" : "#cccccc", "输入框背景" : "linear-gradient(#ffffff, #b3b3b3)", "输入框文字" : "#000000",
        "按钮边框" : "#cccccc", "按钮文字" : "#000000",
        "按钮背景(悬停)" : "linear-gradient(#b3b3b3, #ffffff)", "按钮背景(正常)" : "linear-gradient(#ffffff, #b3b3b3)"
      };
      if (currentCaptcha) this.updateCaptchaHtml();
    }

    setFont(args) {
      visSetting.font = xmlEscape(args.FONT);
      if (currentCaptcha) this.updateCaptchaHtml();
    }

    setColor(args) {
      if (allElements.indexOf(args.THING) === -1) return;
      visSetting[args.THING] = xmlEscape(args.COLOR);
      if (currentCaptcha) this.updateCaptchaHtml();
    }

    // 更新视觉/颜色的辅助函数
    updateCaptchaHtml() {
      currentCaptcha.style.fontFamily = visSetting.font;
      currentCaptcha.style.backgroundColor = `rgba(0, 0, 0, ${visSetting.focusMode ? 0.5 : 0})`;
      const children = currentCaptcha.childNodes;
      // 图片
      children[0].style.backgroundColor = visSetting["图片背景"];
      children[0].style.border = `5px solid ${visSetting["图片边框"]}`;
      // 输入框
      children[1].style.border = `5px solid ${visSetting["输入框边框"]}`;
      children[1].style.background = visSetting["输入框背景"];
      children[1].style.color = visSetting["输入框文字"];
      // 提交按钮
      children[2].style.background = visSetting["按钮背景(正常)"];
      children[2].style.border = `5px solid ${visSetting["按钮边框"]}`;
      children[2].style.color = visSetting["按钮文字"];
    }

    // 将效果编写为HTML字符串的辅助函数
    callVisUpdate(type) {
      let array = [];
      let string = "";
      if (type === "transform") {
        array = ["scale", "rotate", "skewX", "skewY"];
        string += "translate(-50%, -50%) ";
      } else { array = ["blur", "brightness", "contrast", "hue-rotate", "invert", "opacity", "saturate", "sepia"] }
      for (var i = 0; i < array.length; i++) {
        const name = array[i];
        const key = visSetting[name];

        let value = key[0];
        if (name === "opacity") value = 1 - (value / 100);
        if (name === "saturate" || name === "invert" || name === "sepia") value = value / 100;
        if (name === "contrast" || name === "brightness") value = (value + 100) / 100;
        if (name === "rotate") value = value - 90;
        if (name === "scale") value = `${value / 100}, ${key[2] / 100}`;
        string += `${name}(${value}${key[1]}) `;
      }
      return string;
    }

    getEffect(args) {
      let effect = args.EFFECT;
      if (effect === "方向") effect = "rotate";
      if (effect === "饱和度") effect = "saturate";
      if (effect === "倾斜 X") effect = "skewX";
      if (effect === "倾斜 Y") effect = "skewY";
      if (effect.startsWith("缩放")) effect = "scale";
      return visSetting[effect][args.EFFECT === "缩放 Y" ? 2 : 0] ?? "";
    }
  }

  Scratch.extensions.register(new SPcaptcha());

  // 安全功能启用器
  function checkPrimitives() {
    internalUserPass = vm.runtime._primitives.SPcaptcha_userPassed;
    internalUserAnswer = vm.runtime._primitives.SPcaptcha_getResponse;
    internalAnswer = vm.runtime._primitives.SPcaptcha_getAnswer;
    if (internalUserPass === undefined || internalUserAnswer === undefined || internalAnswer === undefined) {
      setTimeout(checkPrimitives, 10);
    }
  }
  checkPrimitives();
})(Scratch);
