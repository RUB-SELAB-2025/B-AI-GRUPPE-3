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
import { select, selectAll } from 'd3-selection';
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
  readonly scrollContainer = viewChild.required<ElementRef<SVGGElement>>('scrollgroup');

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

  constructor() {
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

  // Axes related computations and

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, 0)` //${this.dataservice.margin.top}
  })

  xAxisTransformString = computed(() => {
    const yScale = this.dataservice.yScale();
    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0) 
  });

  yAxisTransformString = computed(() => {
    const xScale = this.dataservice.xScale();
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

  updateScrollContainer = effect(() => {
    const rectSVG = this.svgGraph().nativeElement.getBoundingClientRect();  // Bounding client rectangle of SVG element
    const scrollBarWidth = 8;
    const g = this.scrollContainer().nativeElement;
    const rootG = select(g)
      .attr("clip-path", "url(#scrollbox-clip-path)");
    const rectG = g.getBoundingClientRect();  // Bounding client rectangle of g
    const sizeG = g.getBBox();  // Bounding Box of g
    const svg = this.svgGraph().nativeElement;
    const parentSVG = select('svg');

    // Add graph and x-Axis to content
    const contentItems = rootG.selectAll('*')
    const content = rootG.append('g')
      .attr('transform', 'translate(' + rectG.x + ',' + rectG.y + ')')
      .attr('id', 'contentG');
    console.log(content);
    contentItems.each( function(p, j) {
      const el = this;
      content.append(() => {return el;});
    })
    console.log(content);
  
    const clipRect = parentSVG.append('clipPath').attr('id', 'scrollbox-clip-path').append('rect');  // Clip everything outside of g rectangle
    clipRect
      .attr('x', sizeG.x)
      .attr('y', sizeG.y)
      .attr('width', sizeG.width)
      .attr('height', sizeG.height)
      .attr('transform', 'translate(' + rectG.x + ',0)');  // sizeG.x is at 0, so add offset

    rootG  // Add invisible rectangle which catches scroll actions
      .insert('rect', 'g')
      .attr('x', sizeG.x)
      .attr('y', sizeG.y)
      .attr('width', sizeG.width)
      .attr('height', sizeG.height)
      .attr('opacity', 0)
      .attr('transform', 'translate(' + rectG.x + ',0)');

    /*
    const testRect = parentSVG.append('rect');
    testRect
      .attr('x', sizeG.x)
      .attr('y', sizeG.y)
      .attr('width', sizeG.width)
      .attr('height', sizeG.height)
      .attr('fill', 'blue')
      .attr('transform', 'translate(' + rectG.x + ',0)');
    */

    console.log(sizeG.x + ", " + sizeG.y + ", " + sizeG.width + ", " + sizeG.height);
  })

}
