import { computed, effect, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { rgb as d3RGB, rgb } from 'd3-color';
import {DataFormat, OmnAIScopeDataService} from '../omnai-datasource/omnai-scope-server/live-data.service';
import { type GraphComponent } from './graph.component';
import {DataInfo, DataSourceSelectionService} from '../source-selection/data-source-selection.service';
import { color } from 'd3';
import {Delaunay} from 'd3-delaunay';
import * as domain from 'node:domain';
import {sign} from 'node:crypto';


type UnwrapSignal<T> = T extends import('@angular/core').Signal<infer U> ? U : never;

/**
 * A type to signal, that the last {@link width} milliseconds should be displayed
 */
interface FixedWindow {
  type: 'fixed';
  width: number;
}

/**
 * A type to signal, that only everything between {@link AdjustableWindow.start} and {@link AdjustableWindow.end} should be displayed.
 * {@link AdjustableWindow.start} and {@link AdjustableWindow.end} are interpreted as a Millisecond timestamps from the Unix-Epoch, as per {@link DateConstructor.(:CONSTRUCTOR)}
 */
interface AdjustableWindow {
  type: 'adjustable';
  start?: number;
  end?: number;
}

export type WindowDataAdjust = FixedWindow | AdjustableWindow;


/**
 * Describes the potential Domain values for the x-axis
 * */
type xDomainType = Date;
type xDomainTuple = [xDomainType, xDomainType];

const defaultXDomain: xDomainTuple = [new Date(), new Date(Date.now() - 24 * 60 * 60 * 1000)];

/**
 * Provide the data to be displayed in the {@link GraphComponent}
 * This class also provides the axis descriptions. As these are dependend on the size of the current
 * graph, this service needs to be provided in any component that creates a graph to ensure that
 * every graph has its own state management.
 *  */
@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({width: 800, height: 600});
  private readonly $xDomain = signal<xDomainTuple>(defaultXDomain);
  private readonly $yDomain = signal([0, 100]);
  private readonly dataSourceSelectionService = inject(DataSourceSelectionService);

  readonly margin = {top: 20, right: 30, bottom: 40, left: 60};
  graphDimensions = this.$graphDimensions.asReadonly();

  /**
   * This represents how the {@link DataSourceService.data} signal will be filtered
   */
  readonly range = signal<WindowDataAdjust>({
    type: 'fixed',
    width: 25_000,
  });
  /**
   * Continually Calculates minima and maxima across all Signals for the X and Y axis, whilst respecting {@link DataSourceService.range}
   */
  readonly info = computed(() => {
    const data = this.dataSourceSelectionService.data();

    //Get Raw DataInfo
    const info = new DataInfo();
    //TODO: This could be sped up. https://github.com/AI-Gruppe/OmnAIView/pull/25
    for (const points of Object.values(data)) {
      info.applyDataPoints(points);
    }

    //Apply range info onto that Data Info
    const range = this.range();
    if (range.type == 'fixed') {
      // info.minTimestamp = info.maxTimestamp - range.width;
    } else if (range.type == 'adjustable') {
      if (range.end) info.maxTimestamp = range.end;
      if (range.start) info.minTimestamp = range.start;
    }

    return info;
  })
  /**
   * A signal, which is filtered according to {@link DataSourceService.range}.
   */
  readonly data = computed(() => {
    let data = this.dataSourceSelectionService.data();
    const range = this.range();
    let newData: Record<string, DataFormat[]> = {};
    if (range.type === 'adjustable') {
      // fast path, for if we know, we don't need to filter anything
      // this is the case, if start is either undefined or NEGATIVE_INFINITY
      // and end is undefined or POSITIVE_INFINITY
      if (
        (range.start === undefined || range.start === Number.NEGATIVE_INFINITY) &&
        (range.end === undefined || range.end === Number.POSITIVE_INFINITY)
      ) {
        newData = data;
      }
      //Otherwise filter according to the given description
      else {
        for (const [key, value] of Object.entries(data)) {
           newData[key] = value.filter(v=>
             v.timestamp <= (range.end ?? Number.POSITIVE_INFINITY) &&
               v.timestamp >= (range.start ?? Number.NEGATIVE_INFINITY)
           )
         // newData[key] = value
       }
      }
    } else if (range.type === 'fixed') {
      const info = this.info();
      //info will already have applied the range info. minTimestamp will therefore be the correct value.
      for (const [key, value] of Object.entries(data)) {
        // newData[key] = value.filter(v=> v.timestamp > info.minTimestamp)
        newData[key] = value
      }
    }

    return newData;
  })

  xScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      xDomain: this.$xDomain(),
    }),
    computation: ({dimensions, xDomain}) => {
      const margin = {top: 20, right: 30, bottom: 40, left: 40};
      const margin_width = dimensions.width - margin.left - margin.right;
      const width = this.width();
      return d3ScaleUtc()
        .domain(xDomain)
        .range([0, width+margin_width]);
    },
  });

  public width = computed(()=>{
    let dimension = this.$graphDimensions();
    let range = this.range();
    if (range.type == 'fixed') {
      let info = this.info();
      return Math.max((info.maxTimestamp - info.minTimestamp) / range.width, 1) * dimension.width;
    } else {
      return dimension.width;
    }
  })

  yScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      yDomain: this.$yDomain(),
    }),
    computation: ({dimensions, yDomain}) => {
      const margin = {top: 20, right: 30, bottom: 40, left: 40};
      const height = dimensions.height - margin.top - margin.bottom;
      return d3ScaleLinear()
        .domain(yDomain)
        .range([height, 0]);

    },
  });
  readonly dataArray = computed(()=>{
    let data = this.data();
    let dataMap = [];
    let keys = Object.keys(data);
    keys.sort();
    for (const key of keys) {
      let values = data[key];
      for (const value of values) {
        dataMap.push({key, value});
      }
    }
    return dataMap;
  })
  readonly delaunay = computed(()=>{
    let dataArray = this.dataArray();
    let xScale = this.xScale();
    let yScale = this.yScale();
    return Delaunay.from(dataArray, d => xScale(d.value.timestamp), d => yScale(d.value.value))
  });

  updateGraphDimensions(settings: { width: number; height: number }) {
    const currentSettings = this.$graphDimensions();
    if (
      currentSettings.width !== settings.width ||
      currentSettings.height !== settings.height
    ) {
      this.$graphDimensions.set({width: settings.width, height: settings.height});
    }
  }

  updateScalesWhenDataChanges = effect(() => {
    const data = this.data();
    untracked(() => this.scaleAxisToData(data))
  })

  private scaleAxisToData(data: UnwrapSignal<typeof this.data>) {
    console.log(data)
    if (Object.keys(data).length === 0) return;

    const expandBy = 0.1;

    const initial = {
      minTimestamp: Number.POSITIVE_INFINITY,
      maxTimestamp: Number.NEGATIVE_INFINITY,
      minValue: Number.POSITIVE_INFINITY,
      maxValue: Number.NEGATIVE_INFINITY
    };

    const allPoints = Object.values(data).flat(); // DataFormat[]

    const result = allPoints.reduce((acc, point) => ({
      minTimestamp: Math.min(acc.minTimestamp, point.timestamp),
      maxTimestamp: Math.max(acc.maxTimestamp, point.timestamp),
      minValue: Math.min(acc.minValue, point.value),
      maxValue: Math.max(acc.maxValue, point.value),
    }), initial);

    if (!isFinite(result.minTimestamp) || !isFinite(result.minValue)) return;
    const xDomainRange = result.maxTimestamp - result.minTimestamp;
    const xExpansion = xDomainRange * expandBy;
    if (xDomainRange === 0) {
      this.$xDomain.set(defaultXDomain);
    }
    else {
      this.$xDomain.set([
        new Date(result.minTimestamp),
        new Date(result.maxTimestamp)
      ]);
    }

    const yDomainRange = result.maxValue - result.minValue;
    const yExpansion = yDomainRange * expandBy;

    this.$yDomain.set([
      result.minValue - yExpansion,
      result.maxValue + yExpansion,
    ]);
  }

  readonly paths = linkedSignal({
    source: () => ({
      xScale: this.xScale(),
      yScale: this.yScale(),
      series: this.data()
    }),
    computation: ({xScale, yScale, series}) => {
      const lineGen = d3Line<{ time: Date; value: number }>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value));

      return Object.entries(series).map(([key, points]) => {
        const parsedValues = points.map(({timestamp, value}) => ({
          time: new Date(timestamp),
          value
        }));
        let parsedColorArray = points.map((p) => p.color ?? {r: 72, g: 201, b: 176});  // 72, 201, 176  Parse color value separately so it doesn't interfere with lineGen(), if there's no color value use teal
        if (parsedColorArray.length == 0) parsedColorArray = [{r: 72, g: 201, b: 176}];
        const rgbColorString: string = d3RGB(parsedColorArray[0].r, parsedColorArray[0].g, parsedColorArray[0].b).clamp().toString();  // Parses RGB color value with d3 method, clamp() cleans the RGB values to be between 0...255, returns string useable by html
        const pathData = lineGen(parsedValues) ?? '';  // Generated SVG path
        return { // Data which is available in graph.component.html
          id: key,
          d: pathData,
          color: rgbColorString
          };
        });
    },
  });
}
