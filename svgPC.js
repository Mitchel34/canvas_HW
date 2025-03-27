(function () {
    // Create a container <div> in the body
    const container = d3.select("body")
        .append("div")
        .attr("id", "chart-container")
        .style("width", "1000px")
        .style("margin", "20px auto");

    // Define margins and dimensions
    const margin = { top: 50, right: 200, bottom: 30, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create an <svg> inside the container
    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Create a main group element for the chart
    const mainGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Dimensions to display (in the order we want them)
    const dimensions = ["sepal.length", "sepal.width", "petal.length", "petal.width"];

    // Object to hold a scale for each dimension
    const yScales = {};

    // Create a scalePoint for the x axis to spread out the dimensions
    const xScale = d3.scalePoint()
        .domain(dimensions)
        .range([0, width])
        .padding(0);


    // 2. ADD TOOLTIP (HIDDEN INITIALLY) 
    const tooltip = container
        .append("div")
        .style("position", "absolute")
        .style("background", "#ffffff")
        .style("border", "1px solid black")
        .style("padding", "4px 8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none") 
        .style("opacity", 0);

    // 3. LOAD THE DATA (CSV) 
    d3.csv("./iris.csv").then(data => {

        // 4. CREATE SCALES FOR EACH DIMENSION ------------------------------
        // Manually define domains to match reference image
        yScales["sepal.length"] = d3.scaleLinear()
            .domain([4, 8])
            .range([height, 0]);

        yScales["sepal.width"] = d3.scaleLinear()
            .domain([2, 4.5])
            .range([height, 0]);

        yScales["petal.length"] = d3.scaleLinear()
            .domain([1, 7])
            .range([height, 0]);

        yScales["petal.width"] = d3.scaleLinear()
            .domain([0, 2.5])
            .range([height, 0]);

        // 5. DRAW THE X-AXIS
        const xAxis = d3.axisBottom(xScale)
            .tickValues(dimensions);  // Manually set tick values to match dimensions

        const g = mainGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end" + 10);

        // 6. DRAW Y-AXIS FOR EACH DIMENSION 
        dimensions.forEach(dim => {
            let tickValues;

            // Manually define tick values for each axis to match 
            if (dim === "sepal.length") {
                tickValues = [5, 6, 7];  
            } else if (dim === "sepal.width") {
                tickValues = [2.0, 3.0, 4.0];  
            } else if (dim === "petal.length") {
                tickValues = [1, 2, 3, 4, 5, 6]; 
            } else if (dim === "petal.width") {
                tickValues = [1, 2];  
            }

            const yAxis = d3.axisLeft(yScales[dim])
                .tickValues(tickValues)  // Set tick values manually
                .tickFormat(d3.format(".1f"));  // Format numbers properly

            const g = mainGroup.append("g")
                .attr("class", `y-axis y-axis-${dim}`)
                .attr("transform", `translate(${xScale(dim)}, 0)`)
                .call(yAxis);
        });

        // 7. DEFINE A COLOR SCALE BASED ON VARIETY
        const colorScale = d3.scaleOrdinal()
            .domain(["Setosa", "Versicolor", "Virginica"])
            .range(["#E32636", "#5072A7", "#4CBB17"]); //Match to reference image

        // 8. CREATE A LINE GENERATOR FOR ONE DATA ROW
        function pathGenerator(d) {
            return d3.line()(dimensions.map(dim => {
                return [xScale(dim), yScales[dim](d[dim])];
            }));
        }

        // 9. DRAW THE LINES (ONE PER ROW)
        mainGroup.selectAll(".parallel-line")
            .data(data)
            .join("path")
            .attr("class", "parallel-line")
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.variety))
            .attr("stroke-width", 1.75)
            .attr("d", d => pathGenerator(d))

            // Add tooltip interactivity
            .on("mouseover", function (event, d) {
                // Bring the line to front
                d3.select(this).raise().attr("stroke-width", 3);

                // Single-line tooltip with dashes
                tooltip.html(
                    `${d.variety} - ` +
                    `sepal.length:${d["sepal.length"]} - ` +
                    `sepal.width:${d["sepal.width"]} - ` +
                    `petal.length:${d["petal.length"]} - ` +
                    `petal.width:${d["petal.width"]}`
                )
                    .style("opacity", 1)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mousemove", function (event) {
                // Move tooltip position with cursor
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 1);
                tooltip.style("opacity", 0);
            });

        // 10. ADD A COLOR LEGEND
        // Position legend in the top-right corner
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${width + 100}, 50)`);  // Adjust for top right placement

        const legendData = colorScale.domain();
        legendData.forEach((species, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(0, ${i * 25})`);

            // Color box
            legendItem.append("rect")
                .attr("x", 50)
                .attr("y", 0)
                .attr("width", 40)
                .attr("height", 20)
                .attr("fill", colorScale(species));

            // Text label
            legendItem.append("text")
                .attr("x", -15)
                .attr("y", 14)
                .attr("font-size", "14px")
                .attr("fill", "black")
                .text(species);
        });
        console.log("Visaulization is complete!");
    })
        .catch(error => {
            console.error("Error loading or parsing CSV:", error);
        });
})();
