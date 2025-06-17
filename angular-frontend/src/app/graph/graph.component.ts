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
import { select } from 'd3-selection';
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
  readonly viewPort = new DataSourceService();
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');

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
      });
    }
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

}
