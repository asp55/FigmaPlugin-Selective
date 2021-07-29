import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

interface LooseObject {
  [key: string]: any
}

function Selection(props) {
  //Ingest props
  const selection = props.selection || [],
        mode = props.mode || 0;

  //Parse selection
  let buttons = [];
  if(mode===0) {
    buttons = selection
              .reduce((accumulator,current)=>{
                if(!accumulator.includes(current.name)) return [...accumulator, current.name]; 
                else return accumulator;
              },[])
              .map(name=>
                <button
                  key={`FilterByName-${name}`}
                  onClick={()=>{
                    parent.postMessage({pluginMessage:{
                      type:'Filter', 
                      props: {
                        by:'Name', 
                        name:name
                      }
                    }}, '*')
                  }}
                >{name}</button>
              );
  }
  else if(mode===1) {
    buttons = selection
              .reduce((accumulator, current)=>{
                if(!accumulator.includes(current.type)) return [...accumulator, current.type];
                else return accumulator;
              }, [])
              .map(layerType=>
                <button
                  key={`FilterByType-${layerType}`}
                  onClick={
                    ()=>{parent.postMessage({pluginMessage:{
                      type:'Filter', 
                      props:{by:'Type', type:layerType}
                    }}, '*')}
                  }
                >
                  {layerType}
                </button>
              )
  }
  else if(mode===2) {
    buttons = selection
              .filter(val=>val.type==="INSTANCE")
              .reduce((accumulator, current)=>{
                if(!accumulator.includes(current.main.name)) return [...accumulator, current.main.name];
                else return accumulator;

              }, [])
              .map(mainComponent=>
                <button
                  key={`FilterByInstanceOf-${mainComponent}`}
                  onClick={
                    ()=>{parent.postMessage({pluginMessage:{
                      type:'Filter', 
                      props:{
                        by:'InstanceOf', 
                        component:{name:mainComponent}
                      }
                    }}, '*')}
                  }
                >
                  {mainComponent}
                </button>
              )
  }
  else if(mode===3) {
    let descriptors = [];
    buttons = selection
              .filter(val=>val.type==="INSTANCE")
              .map(mc=>{
                const mainComponent = mc.main;
                const descriptor = mainComponent.hasOwnProperty("variant") ? `${mainComponent.name} (${mainComponent.variant})` : mainComponent.name;
                if(!descriptors.includes(descriptor)) {
                  descriptors.push(descriptor);

                  let component: LooseObject = {name:mainComponent.name};
                  if(mainComponent.hasOwnProperty("variant")) component.variant = mainComponent.variant;
                  
                  return <button
                  key={`FilterByInstanceOf-${descriptor}`}
                  onClick={
                    ()=>{parent.postMessage({pluginMessage:{
                      type:'Filter', 
                      props:{
                        by:'InstanceOf', 
                        component:component
                      }
                    }}, '*')}
                  }
                >
                  {descriptor}
                </button>
                }
                else {
                  return "";
                }
              })
  }
  /*
  else if(mode===1) {

    const layerTypes = selection
                      .reduce((accumulator, current)=>{
                        if(!(accumulator.hasOwnProperty(current.type))) {
                          accumulator[current.type] = {};
                        }
                        if(current.type==="INSTANCE") {
                          let instances = accumulator["INSTANCE"];
                          if(!instances.hasOwnProperty(current.main.name)) {
                            instances[current.main.name] = [];
                          }
                          if(current.main.hasOwnProperty("variant") && !instances[current.main.name].includes(current.main.variant)) {
                            instances[current.main.name].push(current.main.variant);
                          }
                        }
                        return accumulator;
                      }, []);

    buttons = Object.keys(layerTypes)
              .map(layerType=>
                <div 
                  key={`FilterByType-${layerType}`}
                  className="container"
                >
                  <button
                    onClick={
                      ()=>{parent.postMessage({pluginMessage:{
                        type:'Filter', 
                        props:{by:'Type', type:layerType}
                      }}, '*')}
                    }
                  >{layerType}</button>
                  {
                    Object.keys(layerTypes[layerType]).map(mainComponent=>
                      <div 
                      key={`FilterByInstanceOf-${layerType}-${mainComponent}`}
                      className="container"
                      >
                        <button
                          onClick={
                            ()=>{parent.postMessage({pluginMessage:{
                              type:'Filter', 
                              props: {
                                by:'InstanceOf',
                                component:{name:mainComponent}
                              }
                            }}, '*')}
                          }
                        >
                          &nbsp;&nbsp;
                          {mainComponent}
                          {layerTypes[layerType][mainComponent].length===1 ? ` (${layerTypes[layerType][mainComponent][0]})` : ""}
                        </button>
                        {
                          layerTypes[layerType][mainComponent].length>1 && 
                          layerTypes[layerType][mainComponent].map(variant=>
                            <button 
                            key={`FilterByInstanceOf-${layerType}-${mainComponent}-${variant}`}

                            onClick={
                              ()=>{parent.postMessage({pluginMessage:{
                                type:'Filter', 
                                props: {
                                  by:'InstanceOf',
                                  component:{
                                    name:mainComponent,
                                    variant:variant
                                  }
                                }
                              }}, '*')}
                            }
                            >&nbsp;&nbsp;&nbsp;&nbsp;{variant}</button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              )
    console.log(layerTypes);
  }
  */

  return <div id="selection">
    {buttons}
  </div>
}

function nullFunction() {}

function FilterBy(props) {
  const setMode = props.onChange || nullFunction,
        mode = props.mode || 0;

  return <div id="filterby">
    <input type="radio" name="filter" id="filter-by-name" value="0" checked={mode===0} onChange={()=>{setMode(0);}}/> <label htmlFor="filter-by-name">Name</label>
    <input type="radio" name="filter" id="filter-by-type" value="1" checked={mode===1} onChange={()=>{setMode(1);}}/> <label htmlFor="filter-by-type">Type</label>
    <input type="radio" name="filter" id="filter-by-instance" value="3" checked={mode===2} onChange={()=>{setMode(2);}}/> <label htmlFor="filter-by-instance">Component</label>
    <input type="radio" name="filter" id="filter-by-instance-with-variants" value="3" checked={mode===3} onChange={()=>{setMode(3);}}/> <label htmlFor="filter-by-instance-with-variants">Component+variant</label>
  </div>
}

function App(props) {


  const [mode, setMode] = React.useState(0);
  const [selection, setSelection] = React.useState([]);

  //Add event listener to get messages from figma
  React.useEffect(() => {
    function parseMessage(event) {
      console.log("Received Message: ",event.data.pluginMessage);
      if(event.data.pluginMessage.type === "selection") {
        setSelection(event.data.pluginMessage.selection);
      }
    }
    window.addEventListener("message", parseMessage)
    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("message", parseMessage)
    };
  }, []);


  

  
  return <div>
    <FilterBy mode={mode} onChange={setMode} />
    <Selection mode={mode} selection={selection} />
  </div>
}


ReactDOM.render(<App />, document.getElementById('react-page'))
