import xml.etree.ElementTree as ET

def epilogueSVG(output):
    """ Writes the epilogue for the SVG file """
    output.write("</svg>")

def prologueSVG(output):
    """ Writes the prologue for the SVG file """

    output.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    output.write('<svg xmlns="http://www.w3.org/2000/svg" version="2.0">\n\n')

def textSVG(output,textPoints):
    for k, v in textPoints.items():
        output.write(f'<text x="{v}" y="170" style="writing-mode: tb; glyph-orientation-vertical: 0;">')
        output.write(k)
        output.write("</text>\n")

def pointsSVG(output, hitos):

    output.write('<polyline points="') # start of the <polyline> tag

    # start x
    start = 10.0
    # floor y
    floor = 160
    # start point
    output.write(str(start) + "," + str(floor)) # start point

    # dictionary to store the points for the text generation
    points = {
        "Inicio": start   
    }

    # x reference
    x = start
    for hito in hitos:
        
        nameHito = hito.attrib["nombre"]
        altitude = floor - int(hito.find("./{https://www.uniovi.es}coordenadas/{https://www.uniovi.es}altitud").text)
        x += 40 # for the moment distance is not taken into account from xml
        
        """
        Usando distancia absoluta extraida del xml
        distanciaTag = hito.find("./{https://www.uniovi.es}distanciaHitoAnterior")
        distancia = float(distanciaTag.text)
        unidades = distanciaTag.attrib["unidades"]
        if unidades == "km":
            distancia *= 1000
        
        x += distancia
        """
        points[nameHito] = x
        output.write(" " + str(x) + "," + str(altitude))

    x += 40
    output.write(" " + str(x) + "," + str(floor)) # end point
    points["Final"] = x
    
    output.write(" " + str(start) + "," + str(floor)) # to connect the polyline
    output.write('" style="fill:white;stroke:red;stroke-width:2" />\n') # end of the <polyline> tag

    return points


def main():
    """

    Processing XML files that use the following schema:
    <rutas xmlns="https://www.uniovi.es" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.uniovi.es rutas.xsd">

    This XML represents different tourist routes in one or more countries. From it, N files in SVG format 
    (Scalable Vector Graphics) are generated, which can be used to visualise the outline of the whole route
    together with the name of its placemark.

    Version 1.0 2023-11-03
    Didier Yamil Reyes Castro.

    """

    print(main.__doc__)

    # Getting the XML file and generating its DOM tree

    xml = input("Introduce the name of the XML file (full path) = ")

    try:
        tree = ET.parse(xml)
    except IOError:
        print ("File not found: ", xml)
        exit()  
    except ET.ParseError:
        print("Error while processing XML file: ", xml)
        exit()
       
    # Getting the root
    root = tree.getroot()
    
    # Info for file generation
    dirPath = input("Introduce the directory of your output (ex. c:/perfiles/): ")
    i = 1
    defaultOutputName = dirPath + "perfil"
    extensionOutput = ".svg"

    # Getting all the different routes in the XML file
    # For each route...
    for route in root.findall(".//{https://www.uniovi.es}ruta"): # XPath expression
        
        # Open file
        try:
            outputFileName = defaultOutputName + str(i) + extensionOutput
            output = open( outputFileName,"a", encoding="utf-8")
        except IOError:
            print ("Error while creating output file: ", outputFileName)
            exit()

        # Obtaining all hitos from route
        hitos = route.findall("./{https://www.uniovi.es}hitos/{https://www.uniovi.es}hito")

        # Generate prologue
        prologueSVG(output)
        # Generate SVG points
        textPoints = pointsSVG(output, hitos)
        #Generate SVG text
        textSVG(output,textPoints)
        # Generate epilogue
        epilogueSVG(output)

        # Close file
        output.close()

        i += 1
    
    print("Thank you for using xml2perfil. Hope you have a great day :)")

if __name__ == "__main__":
    main()