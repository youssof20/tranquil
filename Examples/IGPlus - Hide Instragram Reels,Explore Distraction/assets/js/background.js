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
let initialState={disabled:!1,dark_mode:!0,disable_reels:!0,disable_explore:!0,counters_gray:!0,disable_vanity:!0,mp_disable_recs:!0,block_images:!1,block_videos:!1,square_shaped:!1,nav_to_messages_first:!1,disable_comments:!1,disable_threads:!1,theme:"default",font:"default",timestamp:Date.now()},browser_cr=chrome||browser;function initStateIfNotExist(){browser_cr.storage.local.get("formState",e=>{e.formState&&0!==Object.keys(e.formState).length||browser_cr.storage.local.set({formState:{...initialState}})})}initStateIfNotExist(),chrome=chrome||browser,browser_cr.runtime.onInstalled.addListener(function(t){"install"!==t.reason&&"update"!==t.reason||chrome.storage.local.get("welcomePageDisplayed",function(e){e.welcomePageDisplayed||"install"!==t.reason?"update"===t.reason&&chrome.tabs.create({url:"https://weblxapplications.com/igp/update"}):(chrome.tabs.create({url:"https://weblxapplications.com/igp/welcome"}),chrome.storage.local.set({welcomePageDisplayed:!0}))})}),browser_cr.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSckNi18UjnA6Zz_eVYMV5YnQXAa93-WsplVmmHIolpcbp0lXA/viewform?usp=sf_link");