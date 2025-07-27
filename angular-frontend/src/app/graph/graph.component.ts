import { isPlatformBrowser, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
  type ElementRef
} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NumberValue, transition } from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { pointer, select } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import { DeviceListComponent } from "../omnai-datasource/omnai-scope-server/devicelist.component";
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { StartDataButtonComponent } from "../source-selection/start-data-from-source.component";
import { DataSourceService } from './graph-data.service';
import { makeXAxisTickFormatter, type xAxisMode } from './x-axis-formatter.utils';
import {DataSource, DataSourceSelectionService} from '../source-selection/data-source-selection.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [MatCheckboxModule, MatIconModule, MatButtonModule, ResizeObserverDirective, JsonPipe, StartDataButtonComponent, DeviceListComponent, MatSlideToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent {
  readonly dataSourceSelection = inject(DataSourceSelectionService);
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');

  readonly viewPort = new DataSourceService();
  readonly svgGraph1 = viewChild.required<ElementRef<SVGElement>>('graphContainer1');
  readonly svgGraph1_scroll = viewChild.required<ElementRef<SVGElement>>('graphContainer1_1');
  readonly svgGraph1_data = viewChild.required<ElementRef<SVGElement>>('graphContainer1_1data');
  readonly scrollFollow = signal(false);
  readonly axesContainer1 = viewChild.required<ElementRef<SVGGElement>>('xAxis1');
  readonly axesYContainer1 = viewChild.required<ElementRef<SVGGElement>>('yAxis1');

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

  lastMousePosition = signal({x: 0, y: 0});
  hovered_datapoint = computed(()=> {
    let lastMousePosition = this.lastMousePosition();
    let svgGraph1_data = this.svgGraph1_data();
    let svgGraph = this.svgGraph();
    let data1_rect = svgGraph1_data.nativeElement.getBoundingClientRect();
    let data2_rect = svgGraph.nativeElement.getBoundingClientRect();
    if (
      lastMousePosition.x-data1_rect.left > 0 &&
      data1_rect.right - lastMousePosition.x > 0 &&
      lastMousePosition.y-data1_rect.top > 0 &&
      data1_rect.bottom - lastMousePosition.y > 0
    ) {
      let x  = lastMousePosition.x-data1_rect.left
      let y  = lastMousePosition.y-data1_rect.top
      console.log("top: x: ", x, ", y: ", y);
      let index = this.viewPort.delaunay().find(x, y);
      let datapoint = this.viewPort.dataArray()[index];
       return {type: "top", datapoint}
    }
    else if (
      lastMousePosition.x-data2_rect.left > 0 &&
      data2_rect.right - lastMousePosition.x > 0 &&
      lastMousePosition.y-data2_rect.top > 0 &&
      data2_rect.bottom - lastMousePosition.y > 0
    ) {
      let x  = lastMousePosition.x-data2_rect.left
      let y  = lastMousePosition.y-data2_rect.top
      console.log("bottom: x: ", x, ", y: ", y);
      let index = this.dataservice.delaunay().find(x, y);
      let datapoint = this.viewPort.dataArray()[index];
       return {type: "bottom", datapoint}
    } else {
       return null
      //not in top or bottom graph
    }
  })

  ngOnInit() {
    let lastUpdate = performance.now();
    window.addEventListener("mousemove", (event) => {
      if (event.movementX || event.movementY) {
        let currentUpdate = performance.now();
        if (Math.abs(currentUpdate - lastUpdate) < 250) return;
        lastUpdate = currentUpdate;
        let pos = pointer(event);
        this.lastMousePosition.set({x: pos[0], y: pos[1]});
      }
    });

    //Taste "m" speichert die aktuelle Position der Maus --> Kann später für Marker benutzt werden
/*
    window.addEventListener("keydown", (event) => {
      if (event.key === "m" || event.key === "M") {
        //const [x, y] = pointer(event, svg.node());
        //mousePositions.push([x, y]);
        let lastMousePosition = this.lastMousePosition();
        mousePositions.push(lastMousePosition);
        console.log("Registered:", lastMousePosition);
        console.log("x: ", lastMousePosition.x, ", y: ", lastMousePosition.y);
      }
    });
 */
  }
  constructor() {
    this.dataservice.range.set({type: 'adjustable'});
    if(this.isInBrowser){
      queueMicrotask(() => {
        const rect = this.svgGraph().nativeElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.dataservice.updateGraphDimensions({ width: rect.width, height: rect.height });
        }
        const rect1 = this.svgGraph1().nativeElement.getBoundingClientRect();
        if (rect1.width > 0 && rect1.height > 0)
          this.viewPort.updateGraphDimensions({ width: rect1.width, height: rect1.height });
      });
    }
  }
  template_top_TransformString = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    let xScale =this.viewPort.xScale();
    let yScale =this.viewPort.yScale();
    if (hovered_datapoint == null || hovered_datapoint.type != "top") return "translate(10000,10000)";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "translate(10000,10000)";
    return `translate(${xScale(datapoint.value.timestamp)}, ${yScale(datapoint.value.value)})`;
  });
  template_top_value = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "top") return "";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "";
    return datapoint.value.value.toString();
  });
  template_top_time = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "top") return "";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "";
    return new Date(datapoint.value.timestamp).toLocaleString();
  });
  template_top_id = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "top") return "";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "";
    return datapoint.key;
  });

  template_bottom_TransformString = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "bottom") return "translate(10000,10000)";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "translate(10000,10000)";
    return `translate(${this.dataservice.xScale()(datapoint.value.timestamp)}, ${this.dataservice.yScale()(datapoint.value.value)})`;
  });
  template_bottom_value = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "bottom") return "";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "";
    return datapoint.value.value.toString();
  });
  template_bottom_time = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "bottom") return "";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "";
    return new Date(datapoint.value.timestamp).toLocaleString();
  });
  template_bottom_id = computed(() => {
    let hovered_datapoint = this.hovered_datapoint();
    if (hovered_datapoint == null || hovered_datapoint.type != "bottom") return "";
    let datapoint = hovered_datapoint.datapoint;
    if (typeof datapoint === "undefined") return "";
    return datapoint.key;
  });

  updateGraphDimensions(dimension: { width: number, height: number }) {
    this.dataservice.updateGraphDimensions(dimension)
  }
  updateGraph1Dimensions(dimension: { width: number, height: number }) {
    this.viewPort.updateGraphDimensions(dimension)
  }

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, ${this.dataservice.margin.top})`
  })

  xAxisTransformString = computed(() => {
    const yScale = this.dataservice.yScale();
    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0)
  });

  yAxisTransformString = computed(() => {
    const xScale = this.dataservice.xScale();
    return `translate(${xScale.range()[0]}, 0)`;
  });

  xAxis1TransformString = computed(() => {
    const yScale = this.viewPort.yScale();
    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0)
  });

  yAxis1TransformString = computed(() => {
    const xScale = this.viewPort.xScale();
    return `translate(${xScale.range()[0]}, 0)`;
  });
  widthBig = this.viewPort.width;

  /**
   * Signal to control the x-axis time mode. Relative starts with 0, absolute reflects the time of day the data was recorded.
   */
  readonly xAxisTimeMode = signal<xAxisMode>("absolute");

  onXAxisTimeModeToggle(checked: boolean): void {
    this.xAxisTimeMode.set(checked ? 'relative' : 'absolute');
  }
  updateXAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.dataservice.xScale();
    const domain = x.domain();
    const formatter = makeXAxisTickFormatter(this.xAxisTimeMode(), domain[0]);
    const g = this.axesContainer().nativeElement;
    select(g)
      .transition(transition())
      .duration(300)
      .call(axisBottom(x).tickFormat(formatter));
  });

  updateYAxisInCanvas = effect(() => {
    if(!this.isInBrowser) return;
    const y = this.dataservice.yScale();
    const g = this.axesYContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });

  updateXAxis1InCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.viewPort.xScale();
    const domain = x.domain();
    const formatter = makeXAxisTickFormatter(this.xAxisTimeMode(), domain[0]);
    const g = this.axesContainer1().nativeElement;
    select(g)
      .transition(transition())
      .duration(300)
      .call(axisBottom(x).tickFormat(formatter));
    if (this.scrollFollow()){
      this.svgGraph1_scroll().nativeElement.scrollLeft = this.widthBig();
    }
  });

  updateYAxis1InCanvas = effect(() => {
    if(!this.isInBrowser) return;
    const y = this.viewPort.yScale();
    const g = this.axesYContainer1().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });
  clearData() {
    for (let test of this.dataSourceSelection.availableSources()) {
      test.clearData();
    }
  }
  public stopped = false;
  toggleFollowData() {
    this.scrollFollow.update(value => !value)
  }
  toggleData() {
    if (this.stopped) {
      for (let test of this.dataSourceSelection.currentSource()) {
        test.connect();
      }
    } else {
      for (let test of this.dataSourceSelection.availableSources()) {
        test.disconnect();
      }
    }
    this.stopped = !this.stopped;
  }
}
