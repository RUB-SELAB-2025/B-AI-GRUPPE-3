import { isPlatformBrowser, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  viewChild,
  type ElementRef
} from '@angular/core';
import { transition } from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { pointer, select } from 'd3-selection';
import { DeviceListComponent } from "../omnai-datasource/omnai-scope-server/devicelist.component";
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { StartDataButtonComponent } from "../source-selection/start-data-from-source.component";
import { DataSourceService } from './graph-data.service';

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [ResizeObserverDirective, JsonPipe, StartDataButtonComponent, DeviceListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent {
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');

  readonly viewPort = new DataSourceService();
  readonly svgGraph1 = viewChild.required<ElementRef<SVGElement>>('graphContainer1');
  readonly axesContainer1 = viewChild.required<ElementRef<SVGGElement>>('xAxis1');
  readonly axesYContainer1 = viewChild.required<ElementRef<SVGGElement>>('yAxis1');

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

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
    const svg = select('svg');
    let mousePositions = [];

    // Mausbewegung tracken, da "keydown" dies nicht ermöglicht

    let lastMousePosition: [number, number] = [0, 0];
    window.addEventListener("mousemove", (event) => {
      if (event.movementX || event.movementY){
        lastMousePosition = pointer(event, svg.node());
      }
    });

    /*
    svg.on("mousemove", function(event) {
      lastMousePosition = pointer(event, svg.node());
    });*/
    

    //Taste "m" speichert die aktuelle Position der Maus --> Kann später für Marker benutzt werden

    window.addEventListener("keydown", (event) => {
      if (event.key === "m" || event.key === "M") {
        //const [x, y] = pointer(event, svg.node());
        //mousePositions.push([x, y]);
        mousePositions.push(lastMousePosition);
        console.log("Registered:", mousePositions[mousePositions.length-1]);
        console.log("x: ", mousePositions[mousePositions.length-1][0], ", y: ", mousePositions[mousePositions.length-1][1]);
        //console.log(pointer(event, svg.node()));

        /*let placeholder1 = 30;
        let placeholder2 = 500;

        svg.append('line').attr('x1', mousePositions[mousePositions.length-1][0]).attr('y1', placeholder1)
        .attr('x2', mousePositions[mousePositions.length-1][0]).attr('y2', placeholder2)
        .attr('stroke', 'steelblue').attr('stroke-width', 2);*/
      }
    });

    /*
    this.svgGraph().nativeElement.addEventListener("keydown", function(event){
        console.log("testg");
        if(event.key === "m" || event.key === "M"){
            mousePositions.push(pointer(event)[0], pointer(event)[1]);
            console.log("Registered: ", mousePositions[mousePositions.length-1]);
        }
    });
    select(this.svgGraph().nativeElement).on("keydown", function(event){
        if(event.key === "m" || event.key === "M"){
            mousePositions.push(pointer(event)[0], pointer(event)[1]);
            console.log("Registered: ", mousePositions[mousePositions.length-1]);
        }
    })*/
   

  }

  updateGraphDimensions(dimension: { width: number, height: number }) {
    this.dataservice.updateGraphDimensions(dimension)
  }
  updateGraph1Dimensions(dimension: { width: number, height: number }) {
    this.viewPort.updateGraphDimensions(dimension)
  }

  // Axes related computations and

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


  updateXAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.dataservice.xScale()
    const g = this.axesContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisBottom(x));
  });

  updateYAxisInCanvas = effect(() => {
    if(!this.isInBrowser) return;
    const y = this.dataservice.yScale();
    const g = this.axesYContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });

  updateXAxis1InCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.viewPort.xScale()
    const g = this.axesContainer1().nativeElement;
    select(g).transition(transition()).duration(300).call(axisBottom(x));
  });

  updateYAxis1InCanvas = effect(() => {
    if(!this.isInBrowser) return;
    const y = this.viewPort.yScale();
    const g = this.axesYContainer1().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });

}
