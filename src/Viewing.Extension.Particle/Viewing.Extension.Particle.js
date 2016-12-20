/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Particle
// by Philippe Leefsma, March 2016
//
/////////////////////////////////////////////////////////////////////
import TranslateTool from './Viewing.Tool.Particle.Translate'
import ParticlePanel from 'Viewing.Extension.Particle.Panel'
import ParticleTool from 'Viewing.Extension.Particle.Tool'
import ExtensionBase from 'Viewer.ExtensionBase'
import SwitchButton from 'SwitchButton'
import Toolkit from 'Viewer.Toolkit'
import FPS from './fpsmeter'
import dat from 'dat-gui'

class ParticleExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this.options = options;

    this.viewer = viewer;

    this.particlePanel = null;

    this.particleTool = new ParticleTool(
      this.viewer, options);

    this.viewer.toolController.registerTool(
      this.particleTool);

    this.transformTool = new TranslateTool(
      this.viewer);

    this.viewer.toolController.registerTool(
      this.transformTool);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Particle';
  }

  /////////////////////////////////////////////////////////////////
  // sleep(ms)
  //
  /////////////////////////////////////////////////////////////////
  static sleep(ms) {

    return new Promise((resolve)=>{

      setTimeout(()=>{
        resolve();
      }, ms);
    });
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.particleTool.loadScene().then(async()=> {

      this.viewer.setProgressiveRendering(
        false);

      //this.viewer.setLightPreset(1);
      //
      //setTimeout(()=> {
      //  this.viewer.setLightPreset(0)
      //}, 100);

      await ParticleExtension.sleep(1000);

      $(this.viewer.container).append(
        '<div id="particle-toolbar"> </div>');

      $('#particle-toolbar').css({
        position: 'absolute',
        left: '10px',
        top: '90px'
      });

      var fps = new FPSMeter(
        document.getElementById('particle-toolbar'), {
        maxFps:    20, //expected
        smoothing: 10,
        show: 'fps',
        decimals: 1,
        left: '0px',
        top: '-80px',
        theme: 'transparent',
        heat: 1,
        graph: 1,
        toggleOn: null,
        history: 32
      });

      var desintegrations = new FPSMeter(
        document.getElementById('particle-toolbar'), {
          maxFps:    500, //expected
          smoothing: 10,
          show: 'fps',
          decimals: 1,
          left: '0px',
          top: '-34px',
          theme: 'transparent',
          heat: 1,
          graph: 1,
          toggleOn: null,
          history: 32,
          legend: ['Desintegrations','']
      });

      //var btn = Toolkit.createButton(
      //  'particle-btn',
      //  'fa fa-spinner',
      //  'Particle Controls', ()=> {
      //    this.particlePanel.toggleVisibility();
      //  });
      //
      //var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      //  "particle-group");
      //
      //ctrlGroup.addControl(btn);
      //
      //var toolbar = new Autodesk.Viewing.UI.ToolBar(true);
      //
      //toolbar.addControl(ctrlGroup);
      //
      //$('#particle-toolbar')[0].appendChild(
      //  toolbar.container);

      this.particlePanel = new ParticlePanel(
        this.particleTool,
        this.viewer,
        null);
        //btn.container);

      this.particlePanel.on('objectModified',(event)=>{

        this.particleTool.onObjectModified(event);
      });

      this.particlePanel.on('maxParticles.changed',(value)=>{

        if(value > 0) {

          if(!this.particleTool.active){

            this.viewer.toolController.activateTool(
              this.particleTool.getName());
          }
        }
        else {

          this.viewer.toolController.deactivateTool(
            this.particleTool.getName());
        }
      });

      this.onTxChange =
        this.onTxChange.bind(this);

      this.transformTool.on('transform.TxChange',
        this.onTxChange);

      this.onSelect =
        this.onSelect.bind(this);

      this.transformTool.on('transform.select',
        this.onSelect);

      this.particleTool.on('fps.tick',()=>{
        fps.tick();
      });

      this.particleTool.on('particle.recycled',()=>{
        desintegrations.tick();
      });

      this.viewer.toolController.activateTool(
        this.transformTool.getName());

      if(this._options.autoStart){

        this.viewer.toolController.activateTool(
          this.particleTool.getName());
      }

      this.particlePanel.setVisible(true);
    });

    console.log('Viewing.Extension.Particle loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // calibrate controls for testing LHC
  //
  /////////////////////////////////////////////////////////////////
  calibrate() {

    var html = `
      <div id="test">
        <input id="testVal1" type="text" style="width:50px;">
        <button id="testBtn1" class="btn btn-info">Set</button>
        <br>
        <input id="testVal2" type="text" style="width:50px;">
        <button id="testBtn2" class="btn btn-info">Set</button>
      </div>
    `

    $(this.viewer.container).append(html);

    $('#test').css({
      position: 'absolute',
      top: '70px',
      left: '20px'
    });

    $('#testBtn1').click(()=>{
      var $input = $('#testVal1');
      var force = parseFloat($input.val());
      this.particleTool.particleSystem.fields.forEach((field)=>{
        if(field.position.magnitude()>30)
          field.force = force;
      });
    });

    $('#testBtn2').click(()=>{
      var $input = $('#testVal2');
      var force = parseFloat($input.val());
      this.particleTool.particleSystem.fields.forEach((field)=>{
        if(field.position.magnitude()<30)
          field.force = force;
      });
    });
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    $('#particle-toolbar').remove();

    if(this.particlePanel)
      this.particlePanel.setVisible(false);

    this.transformTool.off();

    this.viewer.toolController.deactivateTool(
      this.particleTool.getName());

    this.viewer.toolController.deactivateTool(
      this.transformTool.getName());
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onTxChange(txChange) {

    txChange.dbIds.forEach((dbId)=>{

      this.particleTool.updateObjectPosition(dbId);
    });
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelect(select) {

    if(select.dbIds.length){

      var obj = this.particleTool.particleSystem.getObjectById(
        select.dbIds[0]);

      this.particlePanel.setSelected(obj);

      return obj || {selectable: false};
    }
    else{

      this.particlePanel.setSelected(null);
    }
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ParticleExtension.ExtensionId,
  ParticleExtension);