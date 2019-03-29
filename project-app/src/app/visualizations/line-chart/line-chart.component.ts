import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";

import { Localization } from "../localization-fr";
import { DataByState } from "../../data-by-state.model";

@Component({
  selector: "app-line-chart",
  templateUrl: "./line-chart.component.html",
  styleUrls: ["./line-chart.component.css"]
})
export class LineChartComponent implements OnInit {
  private dataByState: DataByState[];
  private readonly NUMBER_OF_MONTHS = 48;

  ngOnInit() {
    d3.json("../../data-by-state.json").then((data: DataByState[]) => {
      this.dataByState = data;

      this.initialization();
    });
  }

  // Début mais pas fini
  private initialization() {
    const marginFocus = {
      top: 30,
      right: 10,
      bottom: 100,
      left: 60
    };
    const widthFocus = 1000 - marginFocus.left - marginFocus.right;
    const heightFocus = 500 - marginFocus.top - marginFocus.bottom;

    const xFocus = d3.scaleLinear().range([0, widthFocus]);
    const yFocus = d3.scaleLinear().range([heightFocus, 0]);

    const tickValues = [];
    for (let i = 0; i < this.NUMBER_OF_MONTHS / 4; i++) {
      tickValues.push(i * 4);
    }

    const xAxisFocus = d3
      .axisBottom(xFocus)
      .tickFormat((d: number) => Localization.getFormattedDateByMonth(d))
      .tickValues(tickValues);
    const yAxisFocus = d3.axisLeft(yFocus);

    const svg = d3
      .select("svg")
      .attr("width", widthFocus + marginFocus.left + marginFocus.right)
      .attr("height", heightFocus + marginFocus.top + marginFocus.bottom);

    const focus = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + marginFocus.left + "," + marginFocus.top + ")"
      );

    const lineFocus = this.createLine(xFocus, yFocus);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    this.domainColor(color);

    this.domainX(xFocus);
    this.domainY(yFocus);

    this.createFocusLineChart(focus, lineFocus, color);

    focus
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightFocus + ")")
      .call(xAxisFocus);

    focus
      .append("g")
      .attr("class", "y axis")
      .call(yAxisFocus);

    focus
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .attr("x", widthFocus)
      .attr("y", heightFocus + 40)
      .text("Temps");

    focus
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .attr("y", -55)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Nombre d'incidents");
  }

  private createLine(
    x: d3.ScaleLinear<number, number>,
    y: d3.ScaleLinear<number, number>
  ) {
    return d3
      .line()
      .x((d, i) => x(i))
      .y((d: any) => y(d))
      .curve(d3.curveBasisOpen);
  }

  private domainColor(color: d3.ScaleOrdinal<string, string>) {
    const states = this.dataByState.map(state => state.state);
    color.domain(states);
  }

  private domainX(xFocus: d3.ScaleLinear<number, number>) {
    xFocus.domain([0, this.NUMBER_OF_MONTHS - 1]);
  }

  private domainY(yFocus: d3.ScaleLinear<number, number>) {
    yFocus
      .domain([0, d3.max(this.dataByState, i => d3.max(i.incidents_by_month))])
      .nice();
  }

  private createFocusLineChart(
    g: d3.Selection<SVGGElement, {}, HTMLElement, any>,
    line: any,
    color: d3.ScaleOrdinal<string, string>
  ) {
    g.selectAll("path")
      .data(this.dataByState)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", d => color(d.state))
      .attr("d", d => line(d.incidents_by_month))
      .attr("clip-path", "url(#clip)")
      .attr("class", d => d.state);
  }
}
