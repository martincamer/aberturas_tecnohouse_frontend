import {
  Document,
  Text,
  View,
  Page,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import logo from "../../../public/logo.png";
import normal from "../../fonts/Montserrat-Light.ttf";
import semibold from "../../fonts/Montserrat-SemiBold.ttf";
import bold from "../../fonts/Montserrat-Bold.ttf";
import React from "react";
import { formatearFecha } from "../../helpers/formatearFecha";

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: normal,
    },
    {
      src: semibold,
      fontWeight: "semibold",
    },
    {
      src: bold,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  table: {
    marginTop: 40,
    display: "table",
    width: "auto",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    fontSize: 10,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
});

export const ImprimirPdfContratos = ({ datos }) => {
  return (
    <Document>
      <Page
        size="A4"
        style={{
          padding: "40px 60px",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontFamily: "Montserrat",
              fontSize: "15px",
            }}
          >
            Contratos filtrados
          </Text>{" "}
          <Image
            src={logo}
            style={{
              width: 100,
            }}
          />
        </View>
        <View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "15%" }]}>Número</Text>
              <Text style={[styles.tableCell, { width: "30%" }]}>Cliente</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                Localidad
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                Número de Contrato
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>Fecha</Text>
            </View>
            {datos.map((salida) =>
              salida.datos_cliente.datosCliente.map((cliente, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {salida.id}
                  </Text>
                  <Text style={[styles.tableCell, { width: "30%" }]}>
                    {cliente.cliente}
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {cliente.localidad}
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {cliente.numeroContrato}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {formatearFecha(salida.created_at)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
