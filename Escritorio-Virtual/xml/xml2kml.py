import xml.etree.ElementTree as ET
import os

def epilogueKML(output):
    """ Writes the epilogue for the KML file """

    output.write("</coordinates>\n")
    output.write("<altitudeMode>relativeToGround</altitudeMode>\n")
    output.write("</LineString>\n")
    output.write("<Style id='redLine'>\n") 
    output.write("<LineStyle>\n") 
    output.write("<color>#ff0000ff</color>\n")
    output.write("<width>5</width>\n")
    output.write("</LineStyle>\n")
    output.write("</Style>\n")
    output.write("</Placemark>\n")
    output.write("</Document>\n")
    output.write("</kml>\n")

def prologueKML(output, routeName):
    """ Writes the prologue for the KML file """

    output.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    output.write('<kml xmlns="http://www.opengis.net/kml/2.2">\n')
    output.write("<Document>\n")
    output.write("<Placemark>\n")
    output.write("<name>"+routeName+"</name>\n")    
    output.write("<LineString>\n")
    output.write("<extrude>1</extrude>\n")
    output.write("<tessellate>1</tessellate>\n")
    output.write("<coordinates>\n")

def contentKML(output, coordinates):
    for coordinate in coordinates:
        longitude = coordinate.find("./{https://www.uniovi.es}longitud").text
        latitude = coordinate.find("./{https://www.uniovi.es}latitud").text
        altitude = coordinate.find("./{https://www.uniovi.es}altitud").text

        output.write(longitude+","+latitude+","+altitude+"\n")



def main():
    """

    Processing XML files that use the following schema:
    <rutas xmlns="https://www.uniovi.es" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.uniovi.es rutas.xsd">

    This XML represents different tourist routes in one or more countries. From it, N files in KML format 
    (Keyhole Markup Language) are generated, which can then be used in various tools like Google Earth to 
    view their planimetry.

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
    dirPath = input("Introduce the directory of your output (ex. c:/rutas/): ")
    i = 1
    defaultOutputName = dirPath + "ruta"
    extensionOutput = ".kml"

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

        # Obtaining route name
        routeName = route.attrib["nombre"]
        # Obtaining coordinates
        coordinates = route.findall("./{https://www.uniovi.es}hitos/{https://www.uniovi.es}hito/{https://www.uniovi.es}coordenadas")



        # Generate prologue
        prologueKML(output, routeName)
        # Generate KML content
        contentKML(output, coordinates)
        # Generate epilogue
        epilogueKML(output)

        # Close file
        output.close()

        i += 1
    
    print("Thank you for using xml2kml. Hope you have a great day :)")

if __name__ == "__main__":
    main()