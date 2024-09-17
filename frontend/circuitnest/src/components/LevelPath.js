import * as d3 from 'd3';
import { Box, Button, Popper, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../util/helperFunctions';
import { GamificationContext } from '../contexts';
import AvatarBird, { AvatarBirdPreLoaded } from './avatar/AvatarBird';
import ReactDOM from 'react-dom/client';

function LevelPath(props) {

    // Get gamification context
    const gamified = useContext(GamificationContext)

    // Add translation
    const { t } = useTranslation();

    // Get MUI theme
    const theme = useTheme()

    // Avatar state
    const [avatarObject, setAvatarObject] = useState(null)

    // Tooltip state
    const [tooltipAnchor, setTooltipAnchor] = useState(null);
    const [tooltipContent, setTooltipContent] = useState(null);

    const handleHover = (anchor, content) => {
        setTooltipAnchor(anchor);
        setTooltipContent(content);
    }

    // Move avatar
    useEffect(() => {
        if (avatarObject && tooltipContent) {
            avatarObject.setAttribute("x", tooltipContent?.x - 130)
            avatarObject.setAttribute("y", tooltipContent?.y - 100)
        }
    }, [avatarObject, tooltipContent])

    // Get dimensions for the level path to use
    const levelBoxRef = useRef();

    // Format level data
    const levelData = useMemo(() => {
        // helper functions
        const levelCompleted = (level) => {
            return props.progress?.find(entry => entry.level.id === level.id)
        }
        const levelUnlocked = (level) => {
            return level.prerequisites.every((prerequisite) => 
                levelCompleted(props.levelData.find((l) => l.id === prerequisite))
            )
        }
    
        var i = 0;
        return {
            levels: props.levelData.map((level) => {
                return {
                    ...level,
                    completed: levelCompleted(level),
                    unlocked: levelUnlocked(level),
                    time: props.progress?.find(entry => entry.level.id === level.id)?.time || -1,
                    stars: props.progress?.find(entry => entry.level.id === level.id)?.star_details || [false, false, false]
                }
            }),
            links: props.levelData.map((level) => {
                return level.prerequisites.map((prerequisite) => {
                    return {
                        index: i++,
                        source: props.levelData.find((l) => l.id === prerequisite),
                        target: level
                    }
                })
            }).flat(1).filter((link) => link != null),
        }
    }, [props.levelData, props.progress])

    const simulationRef = useRef()

    // Create the level path once the component is mounted
    useEffect(() => {
        var destroyFn

        if (levelBoxRef.current) {
            const { destroy, avatarObj } = createLevelPath(levelBoxRef.current, simulationRef.current, levelData, handleHover, theme, gamified, props.prevLevel, props.avatar);
            setAvatarObject(avatarObj)
            destroyFn = destroy
        }

        return destroyFn
    }, [levelBoxRef, levelData, theme])

    return (
        <Box p={0} sx={{ position: 'absolute', top: '0', left: '0', width: `calc(100vw)`, height: `calc(100vh)`, lineHeight: 0, overflowX: 'hidden', overflowY: 'hidden' }}>
            <Box ref={levelBoxRef} sx={{ width: '100%', height: '100%' }} />
            <Popper open={Boolean(tooltipAnchor)} anchorEl={tooltipAnchor} placement="bottom" style={{ zIndex: 1000 }}>
                <Stack 
                    direction={'column'} 
                    sx={{ 
                        padding: 1, 
                        gap: 1, 
                        backgroundColor: theme.palette.background.paper, 
                        borderRadius: 2, 
                        border: `1px solid ${theme.palette.grey[200]}`, 
                        boxShadow: 2 
                    }}
                >
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>{tooltipContent?.title}</Typography>
                    <Button
                        variant="contained"
                        color={"completedLevel"}
                        disabled={!tooltipContent?.unlocked && gamified}
                        onClick={() => props.startLevel(tooltipContent?.id)}
                    >
                        {t('level.start')}
                    </Button>
                </Stack>
            </Popper>
        </Box>
    )
}

export default LevelPath;

function createLevelPath(levelDiv, simulation, levelData, handleHover, theme, gamified, prevLevel, avatar, selectedLevel) {

    // remove all elements from the level div to prevent duplicates
    d3.select(levelDiv).selectAll('*').remove()

    // set the dimensions of the graph
    const containerRect = levelDiv.getBoundingClientRect()
    const width = containerRect.width
    const height = containerRect.height

    // copy the nodes
    const nodes = levelData.levels.map((level) => Object.assign({}, level))

    // stop when there are no nodes
    if (nodes.length === 0) {
        return {
            destroy: () => {},
            nodes: []
        }
    }

    const links = levelData.links.map((link) => {
        return {
            source: nodes.find((node) => node.id === link.source.id),
            target: nodes.find((node) => node.id === link.target.id)
        }
    })

    // helper functions
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])

    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([0, height])

    var xLayer = (layer) => x(layer * 20)

    var levelColor = (level) => {
        // If gamification is disabled, return the completed color
        if (!gamified) {
            if (level.level_type === 'Information') {
                return theme.palette.informationLevel
            } else {
                return theme.palette.completedLevel
            }
        } 

        // Else, return the color based on the level type and progress
        if (!level.unlocked) {
            return theme.palette.lockedLevel 
        } else if (level.level_type === 'Information') {
            return theme.palette.informationLevel
        } else if (level.completed) {
            return theme.palette.completedLevel
        } else if (level.challenge) {
            return theme.palette.challengeLevel
        }

        return theme.palette.unlockedLevel
    }

    // set the node layers depending on the prerequisites
    var maxLayer = 0
    nodes.forEach((node) => {
        node.layer = getNodeLayer(node.id, nodes)
        maxLayer = Math.max(maxLayer, node.layer)
        node.x = xLayer(node.layer)
        node.y = y(50 + node.number)
    })    

    // append the svg object to the body of the page
    const svg = d3.select(levelDiv)
        .append("svg")
        .attr("id", "level-path-svg")
        .attr("width", width)
        .attr("height", height)
        .style("cursor", "grab")

    const g = svg.append("g")

    // add panning capabilities
    const zoom = d3.zoom()
        .scaleExtent([1, 1])
        // Allow panning to fit the whole graph in the view
        .translateExtent([[-width*0.5, 0], [Math.max(xLayer(maxLayer), width/2) + width*0.5, height]])
        .on("zoom", (e) => {
            g.attr("transform", e.transform)
            handleHover(null, null)
        })

    svg.call(zoom)

    // create the simulation
    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-150))
        .force('link', d3.forceLink().links(links).id(d => d.id).strength(0.1).distance(d => Math.abs(d.source.layer - d.target.layer) * x(20) ))
        .force('lock-first', () => {
            nodes[0].x = x(0)
            nodes[0].y = y(50)
        })
        .force('layer-lock', () => {
            nodes.forEach(d => d.x = xLayer(d.layer))
        }) 
        .force('average-center', () => {
            var meanY = d3.mean(nodes, d => d.y)
            nodes.forEach(d => d.vy += 0.01*(y(50) - meanY))
        })
        .force('limit-vertical', () => {
            nodes.forEach(d => d.y = Math.max(y(25), Math.min(y(85), d.y)))
        })

    // set the alpha target higher to fully stabilize the layout
    simulation.alphaTarget(1)

    // run the simulation for a few ticks to stabilize the layout
    simulation.stop()
    simulation.tick(1000)
        
    var levelLinkGroup = g
        .selectAll("line")
        .data(links)
        .enter()

    var levelLinks = levelLinkGroup
        .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .style("stroke", "#663300")
        .style("stroke-width", 8)

    var informationNodesGroup = g
        .selectAll("rect")
        .data(nodes.filter((d) => d.level_type === 'Information'))
        .enter()
        .append("g")
    
    var informationNodes = informationNodesGroup
        .append("rect")
        .attr("x", d => d.x - 40)
        .attr("y", d => d.y - 40)
        .attr("width", 80)
        .attr("height", 80)

    var exerciseNodesGroup = g    
        .selectAll("circle")
        .data(nodes.filter((d) => d.level_type === 'Exercise'))
        .enter()
        .append("g")

    var exerciseNodes = exerciseNodesGroup
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 50)

    simulation.on('tick', () => {
        levelLinks
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            
        informationNodes
            .attr("x", d => d.x - 40)
            .attr("y", d => d.y - 40)

        exerciseNodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
    })

    informationNodes.style("fill", (d) => levelColor(d).main)
        .style("stroke", (d) => levelColor(d).dark)
        .style("stroke-width", 5)
        .style("cursor", "pointer")
        .on("mouseover", (e, d) => handleHover(e.target, d))

    exerciseNodes.style("fill", (d) => levelColor(d).main)
        .style("stroke", (d) => levelColor(d).dark)
        .style("stroke-width", 5)
        .style("cursor", "pointer")
        .on("mouseover", (e, d) => handleHover(e.target, d))

    informationNodesGroup.insert("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(function(d){ return d.number + 1 })
        .style("fill", "#000000")
        .style("font-size", "25px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("pointer-events", "none")

    exerciseNodesGroup.insert("text")
        .attr("x", d => d.x)
        .attr("y", d => gamified ? d.y-5 : d.y)
        .text(function(d){ return d.number + 1 })
        .style("fill", "#000000")
        .style("font-size", "25px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("pointer-events", "none")

    let prevLevelNode = nodes.find((node) => node.id === prevLevel) || nodes[0]

    // Position the graph to be centered on previous level
    svg.call(zoom.transform, d3.zoomIdentity.translate(width/2 - prevLevelNode.x, 0))

    // Only add time, stars and avatar if gamification is enabled
    const avatarObject = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject')
    if (gamified) {
        // Time
        exerciseNodesGroup.insert("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y + 20)
            .text(function(d){ return formatTime(d.time) })
            .style("fill", "#000000")
            .style("font-size", "15px")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("pointer-events", "none")

        // Stars
        exerciseNodesGroup.append("g")
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .selectAll("polygon")
            .data(d => d?.stars)
            .enter()
            // Draw stars
            .append("polygon")
            .attr("points", "0,-5 -1.29,-1.78 -4.76,-1.55 -2.09,0.68 -2.94,4.05 0,2.2 2.94,4.05 2.09,0.68 4.76,-1.55 1.29,-1.78")
            .attr("transform", (d,i) => `rotate(${-30 + i*30}) translate(0, -75) scale(3)`)
            .style("fill", (d) => d ? "#FFD700" : "#D3D3D3")
            .style("stroke", (d) => d ? "#ccad00" : "#a0a0a0")
            .style("stroke-width", 0.5)
            .attr("pointer-events", "none")

        // Avatar
        const avatarRoot = ReactDOM.createRoot(avatarObject)

        avatarObject.setAttribute("x", prevLevelNode.x - 130)
        avatarObject.setAttribute("y", prevLevelNode.y - 100)
        avatarObject.setAttribute("width", 150)
        avatarObject.setAttribute("height", 150)
        avatarObject.setAttribute("pointer-events", "none")
        avatarObject.setAttribute("style", "transition: all 0.75s ease-in-out;")

        avatarRoot.render(<AvatarBirdPreLoaded {...avatar} />)

        g.node().appendChild(avatarObject)
    }

    return {
        destroy: () => {
            simulation.stop();
        },
        nodes: () => {
            return svg.node();
        },
        avatarObj: avatarObject
    }
}

function getNodeLayer(nodeId, nodes) {
    var node = nodes.find((node) => node.id === nodeId)
    var layer = node.layer
    if (!(layer >= 0)) {
        layer = node.prerequisites.length > 0 ? Math.max(...node.prerequisites.map((nodeId => getNodeLayer(nodeId, nodes)))) + 1 : 0
    }

    return layer
}
