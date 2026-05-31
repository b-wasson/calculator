const mf = document.getElementById("currEq");

function init() {
    mf.mathVirtualKeyboardPolicy = "manual";
    mathVirtualKeyboard.layouts = ["minimalist"];
    mathVirtualKeyboard.hide();
    mf.menuItems = [];
    mf.focus();
}

mf.addEventListener("input", () => {
    const latex = mf.getValue();
    console.log(latex);
});

init();
