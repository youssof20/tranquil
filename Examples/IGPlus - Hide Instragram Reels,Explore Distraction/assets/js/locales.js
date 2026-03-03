//   - This file is part of IGPlus Extension
//  <https://github.com/ptjaworski/IGPlus-extension/blob/main/README.md>,
//   - Copyright (C) 2023-present IGPlus Extension
//   -
//   - IGPlus Extension is a software: you can redistribute it, and you are allowed to modify it (for contribution purposes) under the terms of the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) License.
//
//   - IGPlus Extension is distributed in the hope that it will be useful,
//   - but WITHOUT ANY WARRANTY; without even the implied warranty of
//   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   - Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) License for more details.
//   -
//   - You should have received a copy of the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) License
//   - along with IGPlus Extension.  If not, see <https://creativecommons.org/licenses/by-nc-nd/4.0/>.
(()=>{let a=chrome||browser,l,s={};async function r(e){l=e,document.documentElement.setAttribute("lang",e);-1!=["ar","he","ku","fa","ur","sd"].indexOf(e)?document.documentElement.setAttribute("dir","rtl"):document.documentElement.setAttribute("dir","ltr");var t=e;try{var a=await(await fetch(`/_locales/${t}/messages.json`)).json();s[t]=a}catch(e){console.error(`Error fetching translations for ${t}:`,e)}await 0;var r=e,n=document.querySelectorAll("[data-i18n]");for(let e=0;e<n?.length;e++){var o=n[e].getAttribute("data-i18n"),o=s[r]?.[o]?.message;o?.length&&("i18n"===n[e].value?n[e].value=o:n[e].innerText=o)}}a.storage.onChanged.addListener(async(e,t)=>{"local"===t&&e.formState&&e.formState.newValue&&e.formState.newValue.lang_set&&(t=e.formState.newValue.lang_set)!==l&&await r(t)});let n=["en","de","es","pl","uk","sv","ar","be","ru","fr","ja","zh"],o=navigator?.language?.split("-")[0]?.toLowerCase()||"en";a.storage.local.get("formState",async e=>{var t=e.formState.lang_set||(o&&-1!==n.indexOf(o)?o:"en");e.formState.lang_set||a.storage.local.set({formState:{...e.formState,lang_set:t}}),await r(t)})})();