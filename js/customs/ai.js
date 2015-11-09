/**
 * Vertex structure
 * @param x - position x
 * @param y - position y
 * @param key - unique to identify this vertex
 * @constructor
 */
var Vertex = function (x, y, key) {
    this.key = key
    this.x = x;
    this.y = y;
    this.point = new Phaser.Point(this.x, this.y);
};

var Obstacle = function (vertexList) {
    this.vertexList = vertexList;
    this.polygon = new Phaser.Polygon(Obstacle.getPointsArray(this.vertexList));
    // Bound top, bot, left, right
    this.top = this.getTopVertex();
    this.bot = this.getBotVertex();
    this.left = this.getLeftVertex();
    this.right = this.getRightVertex();
    this.virtualCenter = new Phaser.Point((this.left + this.right) / 2, (this.top + this.bot) / 2);
};

Obstacle.prototype.draw = function (graphics) {
    graphics.beginFill(0xFF33ff);
    graphics.drawPolygon(this.polygon);
    graphics.endFill();
};
Obstacle.getPointsArray = function (vertexList) {
    var points = [];
    for (var i = 0; i < vertexList.length; i++) {
        points.push(vertexList[i].point);
    }
    return points;
};
Obstacle.prototype.getTopVertex = function () {
    // Loop through vertices list to find the largest y coordinate
    // Asign top as the largest one
    var top = Infinity;
    var topVertex = null;
    for (var i = 0; i < this.vertexList.length; i++) {
        if (this.vertexList[i].y < top) {
            top = this.vertexList[i].y;
            topVertex = this.vertexList[i];
        }
    }
    return topVertex;
};
Obstacle.prototype.getBotVertex = function () {
    var bot = -Infinity;
    var botVertex = null;
    for (var i = 0; i < this.vertexList.length; i++) {
        if (this.vertexList[i].y > bot) {
            bot = this.vertexList[i].y;
            botVertex = this.vertexList[i];
        }
    }
    return botVertex;
};
Obstacle.prototype.getLeftVertex = function () {
    var left = Infinity;
    var leftVertex = null;
    for (var i = 0; i < this.vertexList.length; i++) {
        if (this.vertexList[i].x < left) {
            left = this.vertexList[i].x;
            leftVertex = this.vertexList[i];
        }
    }
    return leftVertex;
};
Obstacle.prototype.getRightVertex = function () {
    var right = -Infinity;
    var rightVertex = null;
    for (var i = 0; i < this.vertexList.length; i++) {
        if (this.vertexList[i].x > right) {
            right = this.vertexList[i].x;
            rightVertex = this.vertexList[i];
        }
    }
    return rightVertex;
};
var GraphUtils = function (obstaclesList) {
    this.obstaclesList = obstaclesList;
    //TODO remove these attributes
    this.edgesList = this.getEdgesList();
    this.verticesList = this.getVerticesList();
};

GraphUtils.prototype.getCrossObstacles = function (startPoint, endPoint) {
    var crossObstacles = [];
    // Loop through obstacle list
    for (var i = 0; i < this.obstaclesList.length; i++) {
        if (GraphUtils.isCrossOver(startPoint, endPoint, this.obstaclesList[i])) {
            crossObstacles.push(this.obstaclesList[i]);
        }
    }
    crossObstacles.sort(function (a, b) {
        //return a.left.x - b.left.x;
        return a.virtualCenter.distance(startPoint) - b.virtualCenter.distance(startPoint);
    });
    // Append startpoint and endpoint as obstacles
    //if (startPoint.x < endPoint.x) {
    crossObstacles.unshift(new Obstacle([new Vertex(startPoint.x, startPoint.y, 'start')]));
    crossObstacles.push(new Obstacle([new Vertex(endPoint.x, endPoint.y, 'end')]));
    //} else {
    //    crossObstacles.unshift(new Obstacle([new Vertex(endPoint.x, endPoint.y, 'start')]));
    //    crossObstacles.push(new Obstacle([new Vertex(startPoint.x, startPoint.y, 'end')]));
    //}
    return crossObstacles;
};

GraphUtils._isCrossOver = function (startPoint, endPoint, obstacle) {
    // If obstacle has only one vertex, it never been cross by line
    if (obstacle.vertexList.length <= 1)
        return false;
    //Check vertically
    //if ((((startPoint.y - obstacle.top.y) * (endPoint.y - obstacle.top.y) < 0) ||
    //    ((startPoint.y - obstacle.bot.y) * (endPoint.y - obstacle.bot.y) < 0) ||
    //    ((startPoint.y > obstacle.top.y) && (endPoint.y < obstacle.bot.y)))
    //    || (((startPoint.x - obstacle.left.x) * (endPoint.x - obstacle.left.x) < 0) ||
    //    ((startPoint.x - obstacle.right.x) * (endPoint.x - obstacle.right.x) < 0 ||
    //    ((startPoint.x > obstacle.left.x) && (endPoint.x < obstacle.right.x))))) {
    if (true) {
        //TODO check one in two point is in the obstacle area - NO NEED
        var line1 = GraphUtils.getLineObject(startPoint, endPoint);
        var crosspoints = {'num': 0};
        for (var vert = 0; vert < obstacle.vertexList.length; vert++) {
            var point1 = obstacle.vertexList[vert];
            var point2 = obstacle.vertexList[(vert + 1) % obstacle.vertexList.length];
            var line2 = GraphUtils.getLineObject(point1, point2);
            var D = line1.A * line2.B - line2.A * line1.B;
            var Dx = line1.C * line2.B - line2.C * line1.B;
            var Dy = line1.A * line2.C - line2.A * line1.C;
            if (D == 0) {
                if (Dx != 0 || Dy != 0) {
                    //TODO song song - NO NEED
                } else if (Dx == 0 && Dy == 0) {
                    //if (GraphUtils.isAPointInALine(startPoint, point1, point2) ||
                    //    (GraphUtils.isAPointInALine(endPoint, point1, point2)) ||
                    //    (GraphUtils.isAPointInALine(point1, startPoint, endPoint)) ||
                    //    (GraphUtils.isAPointInALine(point2, startPoint, endPoint))) {
                    //    return true;
                    //}
                }
            } else {
                var crossx = Dx / D;
                var crossy = Dy / D;
                var point = new Vertex(crossx, crossy, 'none');
                if (GraphUtils.isAPointInALine(point, point1, point2) && GraphUtils.isAPointInALine(point, startPoint, endPoint)) {
                    if (crosspoints[crossx] == null) {
                        crosspoints[crossx] = crossy;
                        crosspoints['num']++;
                    }
                }
            }
        }
        return (crosspoints['num'] >= 2);
    }
    return false;
};
GraphUtils.isCrossOver = function (startPoint, endPoint, obstacle) {
    if (GraphUtils._isCrossOver(startPoint, endPoint, obstacle)) {
        // Loop through obstacle edges to find out if it real intersect with line
        for (var i = 0; i < obstacle.vertexList.length; i++) {
            //TODO
        }
    }
    return GraphUtils._isCrossOver(startPoint, endPoint, obstacle);
};
GraphUtils.prototype.getEdgesList = function () {
    //TODO
    return null;
};
GraphUtils.prototype.getVerticesList = function () {
    //TODO
    return null;
};
GraphUtils.prototype.getShortestPath = function (startPoint, endPoint) {
    var path = [];
    var graph = new Graph();
    var crossoverObstacle = this.getCrossObstacles(startPoint, endPoint);
    if (crossoverObstacle.length == 0) {
        return [startPoint, endPoint];
    } else {
        //TODO
    }
    //console.log(crossoverObstacle);
    GraphUtils.generate(graph, crossoverObstacle, this.obstaclesList);
    var result = graph.shortestPath('start', 'end');
    //TODO add push 0
    result.push("start");
    result.reverse();

    // Extract vertex from given data
    path.push(startPoint);
    for (var vert = 1; vert < result.length - 1; vert++) {
        path.push(Data.vertexData[result[vert]]);
    }
    path.push(endPoint);
    //console.log(graph);
    return path;
};
/**
 * Generate all the edges and vertices for the graph
 * @param graph - the graph hold all data
 * @param obstacleList - the cross-over obstacles
 */
GraphUtils.generate = function (graph, obstacleList, allObstacle) {
    // Loop through cross obstacle allObstacle
    for (var obsFrom = 0; obsFrom < obstacleList.length - 1; obsFrom++) {
        for (var obsTo = obsFrom + 1; obsTo < obstacleList.length; obsTo++) {
            //var obsTo = obsFrom + 1;
            GraphUtils.connect(obsFrom, obsTo, graph, obstacleList, allObstacle);
        }
    }
};
/**
 * Connect two obstacle by linking its vertices
 * @param from the start obstacle
 * @param to the end obstacle
 * @param graph the graph that holds all the vertices and their edges
 * @param obstacle all the obstacles during the test
 */
GraphUtils.connect = function (from, to, graph, obstacle, allObstacle) {
    // Connect all its own edges
    for (var i = 0; i < obstacle.length; i++) {
        GraphUtils.connectEdgesOfObstacle(obstacle[i], graph);
    }
    var fromObs = obstacle[from];
    var toObs = obstacle[to];
    for (var fromVert = 0; fromVert < fromObs.vertexList.length; fromVert++) {
        //var edges = {};
        for (var toVert = 0; toVert < toObs.vertexList.length; toVert++) {
            // Loop through all the crossover obstacle to check if there is any collision
            var isCollision = false;
            for (var obs = 0; obs < allObstacle.length; obs++) {
                if (GraphUtils.isCrossOver(fromObs.vertexList[fromVert], toObs.vertexList[toVert], allObstacle[obs])) {
                    isCollision = true;
                    break;
                }

            }
            if (!isCollision) {
                var dis = fromObs.vertexList[fromVert].point.distance(toObs.vertexList[toVert].point);
                if (graph.vertices[fromObs.vertexList[fromVert].key] == null) {
                    var edges = {};
                    edges[toObs.vertexList[toVert].key] = dis;
                    graph.addVertex(fromObs.vertexList[fromVert].key, edges);
                } else {
                    graph.addEdgeToVertex(fromObs.vertexList[fromVert].key, toObs.vertexList[toVert].key, dis);
                }
                if (graph.vertices[toObs.vertexList[toVert].key] == null) {
                    var edgesRev = {};
                    edgesRev[fromObs.vertexList[fromVert].key] = dis;
                    graph.addVertex(toObs.vertexList[toVert].key, edgesRev);
                } else {
                    graph.addEdgeToVertex(toObs.vertexList[toVert].key, fromObs.vertexList[fromVert].key, dis);
                }
            }
        }
        //TODO check null sound nerd
        //if (Object.keys(edges).length != 0) {
        //    graph.addVertex(fromObs.vertexList[fromVert].key, edges);
        //}
    }
};
/**
 * get Data of a line: coexist
 * @param a Vertex type
 * @param b Vertex type
 * @returns {{A: number, B: number, C: number}}
 */
GraphUtils.getLineObject = function (a, b) {
    var B = a.x - b.x,
        A = b.y - a.y,
        C = a.x * b.y - a.y * b.x;
    return {'A': A, 'B': B, 'C': C}
};
/**
 * Check a point is in a line (segment)
 * @param p Vertex type
 * @param a Vertex type
 * @param b Vertex type
 * @returns {boolean}
 */
GraphUtils.isAPointInALine = function (p, a, b) {
    // Except case p = a or p = b
    //if (p.x == a.x && p.y == a.y)
    //    return false;
    //if (p.x == b.x && p.y == b.y)
    //    return false;
    var ap = Math.round(a.point.distance(p));
    var bp = Math.round(b.point.distance(p));
    var ab = Math.round(a.point.distance(b));
    var result = (Math.abs(ap + bp - ab) <= 5);
    return (Math.abs(ap + bp - ab) <= 1);
};
/**
 * Connect all edges of a obstacle together
 * @param obstacle
 * @param graph
 */
GraphUtils.connectEdgesOfObstacle = function (obstacle, graph) {
    for (var vert = 0; vert < obstacle.vertexList.length; vert++) {
        var point1 = obstacle.vertexList[vert];
        var point2 = obstacle.vertexList[(vert + 1) % obstacle.vertexList.length];
        var dis = point1.point.distance(point2);
        var edges1 = {};
        var edges2 = {};
        if (graph.vertices[point1.key] == null) {
            edges1[point2.key] = dis;
            graph.addVertex(point1.key, edges1);
        } else {
            graph.addEdgeToVertex(point1.key, point2.key, dis);
        }
        if (graph.vertices[point2.key] == null) {
            edges2[point1.key] = dis;
            graph.addVertex(point2.key, edges2);
        } else {
            graph.addEdgeToVertex(point2.key, point1.key, dis);
        }
    }
};
/////////////////////////////////////////////////////////////////////////////////////////

function PriorityQueue() {
    this._nodes = [];

    this.enqueue = function (priority, key) {
        this._nodes.push({key: key, priority: priority});
        this.sort();
    };
    this.dequeue = function () {
        return this._nodes.shift().key;
    };
    this.sort = function () {
        this._nodes.sort(function (a, b) {
            return a.priority - b.priority;
        });
    };
    this.isEmpty = function () {
        return !this._nodes.length;
    }
}

/**
 * Pathfinding starts here
 */
function Graph() {
    var INFINITY = 1 / 0;
    this.vertices = {};

    this.addVertex = function (name, edges) {
        this.vertices[name] = edges;
    };
    this.addEdgeToVertex = function (vert, edge, distance) {
        this.vertices[vert][edge] = distance;
    };
    this.shortestPath = function (start, finish) {
        var nodes = new PriorityQueue(),
            distances = {},
            previous = {},
            path = [],
            smallest, vertex, neighbor, alt;

        for (vertex in this.vertices) {
            if (vertex === start) {
                distances[vertex] = 0;
                nodes.enqueue(0, vertex);
            }
            else {
                distances[vertex] = INFINITY;
                nodes.enqueue(INFINITY, vertex);
            }

            previous[vertex] = null;
        }

        while (!nodes.isEmpty()) {
            smallest = nodes.dequeue();

            if (smallest === finish) {
                path;

                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }

                break;
            }

            if (!smallest || distances[smallest] === INFINITY) {
                continue;
            }

            for (neighbor in this.vertices[smallest]) {
                alt = distances[smallest] + this.vertices[smallest][neighbor];

                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = smallest;

                    nodes.enqueue(alt, neighbor);
                }
            }
        }

        return path;
    }
}
