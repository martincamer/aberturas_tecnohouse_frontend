import {
  Document,
  Text,
  View,
  Page,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
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

// Definir los estilos
const styles = StyleSheet.create({
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColLarge: {
    width: "60%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
    fontFamily: "Montserrat",
  },
  header: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  content: {
    textTransform: "uppercase",
    fontSize: 8,
    fontWeight: "semibold",
    fontFamily: "Montserrat",
  },
});

export const ImprimirPedido = ({ pedido }) => {
  const aberturas = pedido?.aberturas ? JSON.parse(pedido.aberturas) : [];
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
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 12,
              fontFamily: "Montserrat",
            }}
          >
            {formatearFecha(pedido.created_at)}
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            <Text
              style={{
                fontWeight: "medium",
                fontSize: 12,
                fontFamily: "Montserrat",
              }}
            >
              Fabrica
            </Text>{" "}
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 12,
                fontFamily: "Montserrat",
                textTransform: "capitalize",
              }}
            >
              {pedido.fabrica}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontFamily: "Montserrat",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            Despiece de aberturas.
          </Text>

          <View>
            {aberturas.map((cliente, index) => (
              <View key={index}>
                <Text
                  style={{
                    fontWeight: "semibold",
                    fontFamily: "Montserrat",
                    textTransform: "capitalize",
                    fontSize: 12,
                    marginBottom: 5,
                    marginTop: 10,
                  }}
                >
                  Cliente/Contrato:{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontFamily: "Montserrat",
                      textTransform: "capitalize",
                    }}
                  >
                    {cliente.cliente}
                  </Text>
                </Text>
                <View style={styles.table}>
                  {/* Encabezado de la tabla */}
                  <View style={styles.tableRow}>
                    <View style={[styles.tableColLarge, styles.header]}>
                      <Text style={styles.tableCell}>Detalle</Text>
                    </View>
                    <View style={[styles.tableCol, styles.header]}>
                      <Text style={styles.tableCell}>Medida</Text>
                    </View>
                    <View style={[styles.tableCol, styles.header]}>
                      <Text style={styles.tableCell}>Color</Text>
                    </View>
                    <View style={[styles.tableCol, styles.header]}>
                      <Text style={styles.tableCell}>Categoría</Text>
                    </View>
                    <View style={[styles.tableCol, styles.header]}>
                      <Text style={styles.tableCell}>Cantidad</Text>
                    </View>
                  </View>

                  {/* Filas de la tabla */}
                  {cliente.aberturas.map((abertura, index) => (
                    <View key={index} style={styles.tableRow}>
                      <View style={styles.tableColLarge}>
                        <Text style={[styles.tableCell, styles.content]}>
                          {abertura.detalle}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={[styles.tableCell, styles.content]}>
                          {abertura.medida}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={[styles.tableCell, styles.content]}>
                          {abertura.color}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={[styles.tableCell, styles.content]}>
                          {abertura.categoria}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={[styles.tableCell, styles.content]}>
                          {abertura.cantidad}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};
