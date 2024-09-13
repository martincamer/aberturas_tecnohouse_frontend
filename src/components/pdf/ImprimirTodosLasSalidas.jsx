import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import logo from "../../../public/logo.png";
import normal from "../../fonts/Montserrat-Light.ttf";
import semibold from "../../fonts/Montserrat-SemiBold.ttf";
import bold from "../../fonts/Montserrat-Bold.ttf";

// Registrar fuentes
Font.register({
  family: "Montserrat",
  fonts: [
    { src: normal },
    { src: semibold, fontWeight: "semibold" },
    { src: bold, fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 40,
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  fabrica: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fabricaName: {
    fontFamily: "Montserrat",
    textTransform: "uppercase",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 5,
  },
  tableContainer: {
    marginTop: 10,
    border: "1px solid black",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: "5px",
    fontFamily: "Montserrat",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    alignItems: "center",
    fontSize: "9px",
    textTransform: "uppercase",
    padding: "5px",
  },
  tableCell: {
    padding: "5px",
    width: "40%",
  },
  remitosContratos: {
    marginBottom: 10,
  },
  remitoContratoItem: {
    // marginBottom: 5,
    padding: 5,
  },
  fileItem: {
    marginBottom: 10,
  },
  fileImage: {
    maxWidth: "100%", // Ajustar la imagen al ancho máximo disponible
    maxHeight: "50vh", // Ajustar la imagen al alto máximo disponible
  },
});

export const ImprimirTodosLasSalidas = ({ todasLasSalidas }) => {
  // Objeto para agrupar las salidas por fábrica
  const fabricasAgrupadas = {};

  // Agrupar las salidas por fábrica y sumar cantidades de aberturas por ID
  todasLasSalidas.forEach((salida) => {
    const fabrica = salida.fabrica;

    if (!fabricasAgrupadas[fabrica]) {
      fabricasAgrupadas[fabrica] = {
        aberturas: {},
        remitos: [],
        contratos: [],
        files: [],
      };
    }

    // Agrupar y sumar cantidades de aberturas por ID y detalle
    const aberturas = JSON.parse(salida.aberturas);
    aberturas.forEach((abertura) => {
      const { id, detalle, linea, ancho_alto, cantidad, ...rest } = abertura;
      const aberturaKey = `${id}-${detalle}`;
      if (fabricasAgrupadas[fabrica].aberturas[aberturaKey]) {
        fabricasAgrupadas[fabrica].aberturas[aberturaKey].cantidad +=
          Number(cantidad);
      } else {
        fabricasAgrupadas[fabrica].aberturas[aberturaKey] = {
          id,
          detalle,
          linea,
          ancho_alto,
          cantidad: Number(cantidad),
          ...rest,
        };
      }
    });

    // Agregar remitos
    fabricasAgrupadas[fabrica].remitos.push(...JSON.parse(salida.remitos));

    // Agregar contratos
    fabricasAgrupadas[fabrica].contratos.push(...JSON.parse(salida.contratos));

    // Agregar archivos (files)
    fabricasAgrupadas[fabrica].files.push(...JSON.parse(salida.files));
  });

  return (
    <Document>
      {Object.keys(fabricasAgrupadas).map((fabrica, fabricaIdx) => (
        <Page key={fabricaIdx} size="A4" style={styles.page}>
          <View style={styles.logo}>
            <Image src={logo} />
          </View>
          <View style={styles.fabrica}>
            <Text style={styles.fabricaName}>{fabrica}</Text>
          </View>

          {/* Aberturas */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableHeader}>Aberturas</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>
                Detalle
              </Text>{" "}
              <Text style={[styles.tableCell, styles.tableHeader]}>Medida</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Linea</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>
                Cantidad
              </Text>
            </View>
            {Object.values(fabricasAgrupadas[fabrica].aberturas).map(
              (abertura, idx) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.tableCell}>{abertura.detalle}</Text>
                  <Text style={styles.tableCell}>{abertura.ancho_alto}</Text>
                  <Text style={styles.tableCell}>{abertura.linea}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        fontWeight: "bold",
                        fontFamily: "Montserrat",
                      },
                    ]}
                  >
                    {abertura.cantidad}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Remitos */}
          <View style={[styles.tableContainer, styles.remitosContratos]}>
            <Text style={styles.tableHeader}>Remitos</Text>
            {fabricasAgrupadas[fabrica].remitos.map((remito, idx) => (
              <View style={styles.remitoContratoItem} key={idx}>
                <Text
                  style={{
                    fontSize: "10px",
                    fontFamily: "Montserrat",
                    fontWeight: "semibold",
                    textTransform: "uppercase",
                  }}
                >{`Número: ${remito.numero}`}</Text>
              </View>
            ))}
          </View>

          {/* Contratos */}
          <View style={[styles.tableContainer, styles.remitosContratos]}>
            <Text style={styles.tableHeader}>Contratos</Text>
            {fabricasAgrupadas[fabrica].contratos.map((contrato, idx) => (
              <View style={styles.remitoContratoItem} key={idx}>
                <Text
                  style={{
                    fontSize: "10px",
                    fontFamily: "Montserrat",
                    fontWeight: "semibold",
                    textTransform: "uppercase",
                  }}
                >{`Contrato/numero: ${contrato.nombre}`}</Text>
              </View>
            ))}
          </View>

          {/* Files */}
          <View>
            {fabricasAgrupadas[fabrica].files.map((file, idx) => (
              <View style={styles.fileItem} key={idx}>
                <Image src={file} style={styles.fileImage} />
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};
