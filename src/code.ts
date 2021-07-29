// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

let selectionCache:readonly SceneNode[] = [], 
    skipNextSelectionChange = false;

function sendSelection() {
  selectionCache = figma.currentPage.selection;
  figma.ui.postMessage({
    type:"selection",
    selection:selectionCache.map(
      n=>{
        let main = {};
        if(n.type==="INSTANCE") {
          if(n.mainComponent.parent!==null&&n.mainComponent.parent.type==="COMPONENT_SET") {
            main = {
              name: n.mainComponent.parent.name,
              variant:n.mainComponent.name
            };
          }
          else {
            main = {name: n.mainComponent.name};
          }
        }

        return {
          name: n.name,
          type:n.type,
          main:main
        }
      }
    )
  }); 
}


// This shows the HTML page in "ui.html".
figma.showUI(__html__);
sendSelection();

figma.on("selectionchange", ()=>{
  if(!skipNextSelectionChange) sendSelection();
  else skipNextSelectionChange = false;
})
figma.ui.onmessage = (message,props)=>{
  console.log("Received Message From UI", message, props);

  if(message.type==="Filter") {
    console.log("Filter", message);
    const props = message.props;
    skipNextSelectionChange = true;
    if(props.by==="Name") {
      //console.log("FILTER BY NAME");
      figma.currentPage.selection = selectionCache.filter(n=>n.name===props.name);
    }
    else if(props.by==="Type") {
      //console.log("FILTER BY TYPE");
      const filteredCache = selectionCache.filter(n=>n.type===props.type);
      //console.log(filteredCache);
      figma.currentPage.selection = filteredCache;
    }
    else if(props.by==="InstanceOf") {
      //console.log("FILTER BY INSTANCE OF");
      figma.currentPage.selection = selectionCache.filter(n=>{
        if(n.type!=="INSTANCE") {
          return false;
        }
        else {
          if(props.component.hasOwnProperty("varient")) {
            return (n.mainComponent.name===props.component.varient && n.mainComponent.parent.name===props.component.name);
          }
          else {
            return (n.mainComponent.name===props.component.name || (n.mainComponent.parent && n.mainComponent.parent.name===props.component.name));
          }
          
        }

      })
    }
  }
}