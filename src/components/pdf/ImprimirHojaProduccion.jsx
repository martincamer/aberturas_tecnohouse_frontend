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

export const ImprimirHojaProduccion = ({ pedido }) => {
  const aberturas = pedido?.aberturas ? JSON.parse(pedido.aberturas) : [];
  console.log(aberturas);

  // Función para agrupar aberturas por tipo y atributos
  const agruparPorTipoYAtributos = (aberturas) => {
    const gruposPorTipo = {};

    aberturas.forEach((cliente) => {
      cliente.aberturas.forEach((abertura) => {
        const tipo = abertura.tipo;

        if (!gruposPorTipo[tipo]) {
          gruposPorTipo[tipo] = {};
        }

        // La clave incluye detalle, medida, categoría y color
        const key = `${abertura.detalle}-${abertura.medida}-${abertura.categoria}-${abertura.color}`;

        if (!gruposPorTipo[tipo][key]) {
          gruposPorTipo[tipo][key] = {
            detalle: abertura.detalle,
            medida: abertura.medida,
            color: abertura.color,
            categoria: abertura.categoria,
            cantidad: 0,
          };
        }

        gruposPorTipo[tipo][key].cantidad += parseInt(abertura.cantidad, 10);
      });
    });

    // Convertir cada tipo en un array de objetos agrupados
    Object.keys(gruposPorTipo).forEach((tipo) => {
      gruposPorTipo[tipo] = Object.values(gruposPorTipo[tipo]);
    });

    return gruposPorTipo; // Devuelve un objeto con los tipos como claves
  };

  const aberturasAgrupadas = agruparPorTipoYAtributos(aberturas);

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
            Hoja de producción aberturas.
          </Text>

          <View
            style={{
              marginTop: 10,
            }}
          >
            {Object.keys(aberturasAgrupadas).map((tipo, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    marginBottom: 5,
                    fontSize: 12,
                  }}
                >
                  {tipo.toUpperCase()}
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
                  {aberturasAgrupadas[tipo].map((abertura, index) => (
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
