import { EventHook } from "./event";


export namespace UserConfig {
    export const evtConfigImport = new EventHook<{[k: string]: any}>();

    let cfgVals: {[k: string]: any};

    {
        let userConfigStr = localStorage.getItem("userConfig");

        if (userConfigStr) {
            cfgVals = JSON.parse(userConfigStr);
        } else {
            cfgVals = {};
        }
    }

    export function get(key: string): any {
        return cfgVals[key];
    }

    export function set(key: string, val: any, save: boolean = true) {
        cfgVals[key] = val;

        if (save === true) {
            saveConfig();
        }
    }

    function saveConfig() {
        localStorage.setItem("userConfig", JSON.stringify(cfgVals));
    }

    export function exportToFile() {
        let data = "data:text/json;charset=utf-8," + JSON.stringify(cfgVals);
        let uri = encodeURI(data);
        let link = document.createElement("a");
        link.setAttribute("href", uri);
        link.setAttribute("download", "userConfig.json");
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    export function importFromFile() {
        let inp: HTMLInputElement = document.createElement("input");
        inp.type = "file";
        inp.style.visibility = "hidden";

        inp.addEventListener("change", (e: any) => {
            let file = e.target.files[0];
            if (!file) {
                return;
            }

            let reader = new FileReader();
            reader.onload = (e1: any) => {
                let text = e1.target.result;
                let vals = JSON.parse(text);
                // cfgVals = vals;
                evtConfigImport.fire(vals);
                // saveConfig();
            };
            reader.readAsText(file);

        });

        document.body.appendChild(inp);
        inp.click();
        document.body.removeChild(inp);
    }
}
