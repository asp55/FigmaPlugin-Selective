let mode = 0;
let selection = [];
const selectionControl = document.getElementById("selection");

function setMode() {
  let checkedFilter = document.querySelector('input[name="filter"]:checked');
  if(!(checkedFilter instanceof HTMLInputElement)) {
    throw new Error(`Expected e to be an HTMLInputElement, was ${checkedFilter && checkedFilter.constructor && checkedFilter.constructor.name || checkedFilter}`);
  }
  mode = Number(checkedFilter.value);
  parseSelection();
}
setMode();
document.querySelectorAll('[name="filter"]').forEach(n=>n.addEventListener("change",setMode));


function parseSelection() {
  selectionControl.innerHTML = '';
  //console.log(selection);
  if(mode===0) {
    let uniqueLayerNames = selection.reduce((a,c)=>{
      if(!a.includes(c.name)) return [...a, c.name]; 
      else return a;
    },[]);
    
    let layerButtons = uniqueLayerNames.map(n=>{
      const button = document.createElement("button");
      button.innerHTML = n;
      button.onclick = ()=>{parent.postMessage({pluginMessage:{
        command:'Filter', 
        props: {
          by:'Name', 
          name:n
        }
      }}, '*')};
      return button;
    });

    //console.log(layerButtons);
    layerButtons.forEach(b=>selectionControl.appendChild(b));
  }
  else if(mode===1) {
    let layerTypes = {
      "BOOLEAN_OPERATION": 0,
      "COMPONENT": 0,
      "COMPONENT_SET": 0,
      "DOCUMENT": 0,
      "ELLIPSE": 0,
      "FRAME": 0,
      "GROUP": 0,
      "INSTANCE": 0,
      "LINE": 0,
      "PAGE": 0,
      "POLYGON": 0,
      "RECTANGLE": 0,
      "SLICE": 0,
      "STAR": 0,
      "TEXT": 0,
      "VECTOR": 0
    };
    let instances = {};
    selection.forEach(n=>{
      layerTypes[n.type]++;
      if(n.type==="INSTANCE") {
        if(!instances.hasOwnProperty(n.main.name)) {
          instances[n.main.name] = [];
        }
        if(n.main.hasOwnProperty("variant") && !instances[n.main.name].includes(n.main.variant)) {
          instances[n.main.name].push(n.main.variant);
        }
      }
    })

    let objectButtons = [];
    Object.keys(layerTypes).forEach(v=>{
      if(layerTypes[v]>0) {
        const button = document.createElement("button");
        button.innerHTML = v;
        button.onclick = ()=>{parent.postMessage({pluginMessage:{
          command:'Filter', 
          props:{by:'Type', type:v}
        }}, '*')};
        objectButtons.push(button);

        if(v==="INSTANCE") {
          Object.keys(instances).forEach(i=>{
            const instanceButton = document.createElement("button");
            instanceButton.innerHTML = `&nbsp;&nbsp;${i}`;
            instanceButton.onclick = ()=>{
              parent.postMessage({
                pluginMessage:{
                  command:'Filter',
                  props: {
                    by:'InstanceOf',
                    component:{name:i}
                  }
                }
              }, '*');
            };
            objectButtons.push(instanceButton);

            instances[i].forEach(varient=>{
              const varientButton = document.createElement("button");
              varientButton.innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;(Varient: ${varient})`;
              varientButton.onclick = ()=>{
                parent.postMessage({
                  pluginMessage:{
                    command:'Filter',
                    props: {
                      by:'InstanceOf',
                      component:{
                        name:i,
                        varient:varient
                      }
                    }
                  }
                }, '*');
              }
              objectButtons.push(varientButton);
            })
          })
        }
      }
    });

    objectButtons.forEach(b=>selectionControl.appendChild(b));

  }

  
}

onmessage = (event)=>{
  if(event.data.pluginMessage.type === "selection") {
    selection = event.data.pluginMessage.selection;
    parseSelection();
  }
}