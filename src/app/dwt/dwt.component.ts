import { Component, OnInit } from '@angular/core';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import { EditorSettings, ThumbnailViewerSettings } from 'dwt/dist/types/WebTwain.Viewer';

@Component({
  selector: 'app-dwt',
  templateUrl: './dwt.component.html',
  styleUrls: ['./dwt.component.css']
})
export class DwtComponent implements OnInit {
  bDWObject2Exist: boolean = false;
  selectSources: HTMLSelectElement;
  containerId = 'dwtcontrolContainer';
  bWASM = Dynamsoft.Lib.env.bMobile || Dynamsoft.WebTwainEnv.UseLocalService;
  constructor() { }

  ngOnInit(): void {
    Dynamsoft.WebTwainEnv.Containers = [{ WebTwainId: 'dwtObject', ContainerId: this.containerId, Width: '500', Height: '600' }];
    Dynamsoft.WebTwainEnv.ProductKey = 't0137mQIAAG1DSSCV7sMQPbkSILU2xBhXvo5LeMVMwWZiUcts659hF4ot04lemKV2EhNUMmbzd/drl6kbwqyPQtOSZj9bKzdYOgZrFeVUNoWbkcv8qtFm8FLnj+vCZ8RhdGxqX/joXfp57kYcRsemmwfZXi/sCm4tD7+MOIyOTcvzNPYbU4kpHY1WgtE=';
    Dynamsoft.WebTwainEnv.ResourcesPath = 'assets/dwt-resources';
  }
  /**
   * Dynamsoft_OnReady is called when a WebTwain instance is ready to use.
   * In this callback we do some initialization.
   */
  Dynamsoft_OnReady(): void {
    var obj = Dynamsoft.WebTwainEnv.GetWebTwain(this.containerId);
    if (this.bWASM) {
      obj.MouseShape = true;
    } else {
      this.populateSources(obj);
      document.getElementById("captureButtons").style.display = "";
      document.getElementById("captureButtons2").style.display = "none";
    }
  }
  populateSources(obj: WebTwain): void {
    let sources = obj.GetSourceNames();
    this.selectSources = <HTMLSelectElement>document.getElementById("sources");
    this.selectSources.options.length = 0;
    for (let i = 0; i < sources.length; i++) {
      this.selectSources.options.add(new Option(<string>sources[i], i.toString()));
    }
  }
  /**
   * Acquire images from scanners or cameras or local files
   */
  acquireImage(): void {
    var obj = Dynamsoft.WebTwainEnv.GetWebTwainEx('dwtcontrol');
    if (!obj)
      obj = Dynamsoft.WebTwainEnv.GetWebTwain();
    if (this.bWASM) {
      alert("Scanning is not supported under the WASM mode!");
    }
    else if (obj.SourceCount > 0 && obj.SelectSourceByIndex(this.selectSources.selectedIndex)) {
      const onAcquireImageSuccess = () => { obj.CloseSource(); };
      const onAcquireImageFailure = onAcquireImageSuccess;
      obj.OpenSource();
      obj.AcquireImage({}, onAcquireImageSuccess, onAcquireImageFailure);
    } else {
      alert("No Source Available!");
    }
  }
  /**
   * Open local images.
   */
  openImage(): void {
    var obj = Dynamsoft.WebTwainEnv.GetWebTwainEx('dwtcontrol');
    if (!obj)
      obj = Dynamsoft.WebTwainEnv.GetWebTwain();
    if (!obj)
      obj = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
    obj.IfShowFileDialog = true;
    /**
     * Note, this following line of code uses the PDF Rasterizer which is an extra add-on that is licensed seperately
     */
    obj.Addon.PDF.SetConvertMode(Dynamsoft.EnumDWT_ConvertMode.CM_RENDERALL);
    obj.LoadImageEx("", Dynamsoft.EnumDWT_ImageType.IT_ALL,
      () => {
        //success
      }, () => {
        //failure
      });
  }
  defaultDWT(): void {
    Dynamsoft.WebTwainEnv.DeleteDWTObject('dwtcontrol');
    this.bDWObject2Exist = false;
    Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', () => { this.Dynamsoft_OnReady(); });
    Dynamsoft.WebTwainEnv.Load();
  }
  noViewerDWT(): void {
    Dynamsoft.WebTwainEnv.Unload();
    document.getElementById("captureButtons").style.display = "none";
    document.getElementById("captureButtons2").style.display = "none";
    Dynamsoft.WebTwainEnv.CreateDWTObjectEx(
      {
        WebTwainId: 'dwtcontrol'
      },
      (obj) => {
        this.bDWObject2Exist = true;
        this.populateSources(obj);
      }, (err) => {
        console.log(err);
      });
  }
  regularViewer(): void {
    document.getElementById("captureButtons").style.display = "";
    document.getElementById("captureButtons2").style.display = "none";
    if (this.bDWObject2Exist) {
      var obj = Dynamsoft.WebTwainEnv.GetWebTwainEx('dwtcontrol');
      obj.Viewer.unbind();
      obj.Viewer.bind(<HTMLDivElement>document.getElementById('dwtcontrolContainer'));
      obj.Viewer.height = "500";
      obj.Viewer.width = "600";
      obj.Viewer.show();
    }
  }
  thumbViewer(): void {
    document.getElementById("captureButtons").style.display = "";
    document.getElementById("captureButtons2").style.display = "none";
    if (this.bDWObject2Exist) {
      var obj = Dynamsoft.WebTwainEnv.GetWebTwainEx('dwtcontrol');
      obj.Viewer.unbind();
      obj.Viewer.bind(<HTMLDivElement>document.getElementById('dwtcontrolContainer'));
      obj.Viewer.height = "500";
      obj.Viewer.width = "600";
      var thumbnailViewerSettings: ThumbnailViewerSettings = {
        hoverBorder: "1px solid rgb(238, 238, 238)",
        selectedImageBorder: "1px solid rgb(125,162,206)",
        selectedImageBackground: "rgb(199, 222, 252)",
        location: 'left',
        size: '30%',
        columns: 1,
        rows: 3,
        scrollDirection: 'vertical', // 'horizontal'
        //pageMargin: 10,
        margin: 10,
        background: "rgb(255, 255, 255)",
        border: '',
        allowKeyboardControl: true,
        allowPageDragging: true,
        allowResizing: false,
        showPageNumber: false,
        pageBackground: "transparent",
        pageBorder: "1px solid rgb(238, 238, 238)",
        hoverBackground: "rgb(239, 246, 253)",
        //hoverPageBorder: "1px solid rgb(238, 238, 238)",
        placeholderBackground: "rgb(251, 236, 136)",
        //selectedPageBorder: "1px solid rgb(125,162,206)",
        //selectedPageBackground: "rgb(199, 222, 252)"
      };
      var thumbnail = obj.Viewer.createThumbnailViewer(thumbnailViewerSettings);
      thumbnail.show();
      obj.Viewer.show();
    }
  }
  editorViewer(): void {
    if (this.bDWObject2Exist) {
      document.getElementById("captureButtons").style.display = "";
      document.getElementById("captureButtons2").style.display = "none";
      var obj = Dynamsoft.WebTwainEnv.GetWebTwainEx('dwtcontrol');
      obj.Viewer.unbind();
      obj.Viewer.bind(<HTMLDivElement>document.getElementById('dwtcontrolContainer'));
      obj.Viewer.height = "100";
      obj.Viewer.width = "600";
      obj.Viewer.setViewMode(5, -1);
      var editorSettings: EditorSettings = {
        element: <HTMLDivElement>document.getElementById("dwtEditor"),
        width: 600,
        height: 500,
        border: "1px solid rgb(238, 238, 238)",
        topMenuBorder: "1px solid rgb(238, 238, 238)",
        innerBorder: "1px solid rgb(238, 238, 238)",
        background: "grey",
        promptToSaveChange: true,
        buttons: {
          titles: {
            'previous': 'Previous -Image',
            'next': 'Next Image',
            'print': 'Print Image',
            'scan': 'Scan Documents',
            'load': 'Load Local Images',
            'rotateleft': 'Rotate Left',
            'rotate': 'Rotate',
            'rotateright': 'Rotate Right',
            'deskew': 'Deskew',
            'crop': 'Crop Selected Area',
            'cut': 'Cut Selected Area',
            'changeimagesize': 'Change Image Size',
            'flip': 'Flip Image',
            'mirror': 'Mirror Image',
            'zoomin': 'Zoom In',
            'originalsize': 'Show Original Size',
            'zoomout': 'Zoom Out',
            'stretch': 'Stretch Mode',
            'fit': 'Fit Window',
            'fitw': 'Fit Horizontally',
            'fith': 'Fit Vertically',
            'hand': 'Hand Mode',
            'rectselect': 'Select Mode',
            'zoom': 'Click to Zoom In',
            'restore': 'Restore Original Image',
            'save': 'Save Changes',
            'close': 'Close the Editor',
            'removeall': 'Remove All Images',
            'removeselected': 'Remove All Selected Images'
          },
          visibility: {
            'scan': false, 'load': false, 'print': false,
            'removeall': true, 'removeselected': true,
            'rotateleft': true, 'rotate': true, 'rotateright': true, 'deskew': true,
            'crop': true, 'erase': true, 'changeimagesize': true, 'flip': true, 'mirror': true,
            'zoomin': true, 'originalsize': true, 'zoomout': true, 'stretch': true,
            'fit': true, 'fitw': true, 'fith': true,
            'hand': true, 'rectselect': true, 'zoom': true, 'restore': true, 'save': true, 'close': true
          }
        },
        dialogText: {
          dlgRotateAnyAngle: ['Angle :', 'Interpolation:', 'Keep size', '  OK  ', 'Cancel'],
          dlgChangeImageSize: ['New Height :', 'New Width :', 'Interpolation method:', '  OK  ', 'Cancel'],
          saveChangedImage: ['You have changed the image, do you want to keep the change(s)?', '  Yes  ', '  No  '],
          selectSource: ['Select Source:', 'Select', 'Cancel', 'There is no source available']
        },
      }
      var imgEditor = obj.Viewer.createImageEditor(editorSettings);
      imgEditor.show();
      obj.Viewer.show();
    }
  }
  customViewer(): void {
    if (this.bDWObject2Exist) {
      var obj = Dynamsoft.WebTwainEnv.GetWebTwainEx('dwtcontrol');
      obj.Viewer.unbind();
      obj.Viewer.bind(<HTMLDivElement>document.getElementById('dwtcontrolContainer'));
      obj.Viewer.height = "500";
      obj.Viewer.width = "600";
      document.getElementById("captureButtons").style.display = "none";
      document.getElementById("captureButtons2").style.display = "";
      var custmEl = obj.Viewer.createCustomElement(<HTMLDivElement>document.getElementById("captureButtons2"), "left");
      obj.Viewer.show();
      custmEl.show();
    }
  }
}
