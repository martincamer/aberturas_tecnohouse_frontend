import {
  Document,
  Text,
  View,
  StyleSheet,
  Page,
  Image,
  Font,
} from "@react-pdf/renderer";
import logo from "../../../public/logo.png";
import normal from "../../fonts/Montserrat-Light.ttf";
import semibold from "../../fonts/Montserrat-SemiBold.ttf";
import bold from "../../fonts/Montserrat-Bold.ttf";
import React from "react";

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

// Obtener la fecha actual
const fechaActual = new Date();

// Obtener el día de la semana (0 para domingo, 1 para lunes, ..., 6 para sábado)
const diaDeLaSemana = fechaActual.getDay();

// Obtener el día del mes
const diaDelMes = fechaActual.getDate();

// Obtener el mes (0 para enero, 1 para febrero, ..., 11 para diciembre)
const mes = fechaActual.getMonth();

// Obtener el año
const ano = fechaActual.getFullYear();

// Días de la semana en español
const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

// Meses en español
const meses = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Formatear la fecha
const fechaFormateada = `${diasSemana[diaDeLaSemana]} ${meses[mes]} / ${diaDelMes} / ${ano}`;

export const ImprimirPdfRemuneracion = ({ unicaSalida }) => {
  const totalSuma = unicaSalida?.datos_cliente?.datosCliente?.reduce(
    (acumulador, elemento) => {
      // Convertir la propiedad totalFlete a número y sumarla al acumulador
      return acumulador + parseFloat(elemento.totalFlete);
    },
    0
  ); // Iniciar el acumulador en 0

  return (
    <Document>
      <Page
        size="A4"
        style={{
          padding: "40px 60px",
        }}
      >
        <View>
          <View
            style={{
              width: "100%",
              marginBottom: "5px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontWeight: "semibold",
                textTransform: "uppercase",
                border: "1px solid #000",
                padding: "5px 10px",
                textAlign: "center",
              }}
            >
              {unicaSalida.fabrica}
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* logo */}
            <Image
              style={{
                width: "100px",
              }}
              src={logo}
            />
          </View>

          <View
            style={{
              display: "flex",
              marginTop: "20px",
              flexDirection: "row",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                textDecoration: "",
                fontSize: "12px",
              }}
            >
              REMUNERACION - DATOS
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              marginTop: "20px",
              flexDirection: "row",
              width: "100%",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: "black",
                width: "80px",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "semibold",
                  fontFamily: "Montserrat",
                }}
              >
                {unicaSalida?.created_at?.split("T")[0]}
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "underline",
              }}
            >
              Datos del cliente
            </Text>
          </View>

          <View
            style={{
              border: "1px solid #000",
              // padding: "10px 20px
              marginTop: "10px",
              borderRadius: "10px",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100$%",
                borderBottom: "1px solid #000",
                padding: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  width: "30%",
                }}
              >
                Clientes
              </Text>
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  width: "30%",
                }}
              >
                Localidad
              </Text>
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  width: "20%",
                }}
              >
                Metros
              </Text>
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  width: "20%",
                }}
              >
                Total del fletero
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100$%",
                // borderBottom: "1px solid #000",
                padding: "10px",
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: "8px",
                  fontFamily: "Montserrat",
                  width: "30%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                }}
              >
                {unicaSalida?.datos_cliente?.datosCliente.map(
                  (datos, index) => (
                    <React.Fragment key={datos.numeroContrato}>
                      <Text>
                        {datos.cliente} ({datos.numeroContrato})
                      </Text>
                      {index !==
                        unicaSalida.datos_cliente.datosCliente.length - 1 && (
                        <Text> / </Text>
                      )}
                    </React.Fragment>
                  )
                )}
              </Text>
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  width: "30%",
                }}
              >
                {unicaSalida?.datos_cliente?.datosCliente.map(
                  (datos, index) => (
                    <React.Fragment key={datos.localidad}>
                      <Text>{datos.localidad}</Text>
                      {index !==
                        unicaSalida.datos_cliente.datosCliente.length - 1 && (
                        <Text> / </Text>
                      )}
                    </React.Fragment>
                  )
                )}
              </Text>
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  width: "20%",
                }}
              >
                {unicaSalida?.datos_cliente?.datosCliente.map(
                  (datos, index) => (
                    <React.Fragment key={index}>
                      <Text>{datos.metrosCuadrados} mts</Text>
                      {index !==
                        unicaSalida.datos_cliente.datosCliente.length - 1 && (
                        <Text>, </Text>
                      )}
                    </React.Fragment>
                  )
                )}
              </Text>
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  width: "20%",
                }}
              >
                {unicaSalida?.datos_cliente?.datosCliente.map(
                  (datos, index) => (
                    <React.Fragment key={index}>
                      <Text>
                        {Number(datos.totalFlete).toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumIntegerDigits: 2,
                        })}
                      </Text>
                      {index !==
                        unicaSalida.datos_cliente.datosCliente.length - 1 && (
                        <Text> / </Text>
                      )}
                    </React.Fragment>
                  )
                )}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: "20px",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Datos de la carga/fletero/etc
            </Text>
          </View>

          <View
            style={{
              border: "1px solid #000",
              // padding: "10px 20px
              marginTop: "10px",
              borderRadius: "10px",
              flexDirection: "column",
              gap: "10px",
              padding: "15px 10px",
            }}
          >
            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Nombre del armador:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {unicaSalida.armador}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Nombre del chofer:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {unicaSalida.chofer}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Total de km lineal:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {unicaSalida.km_lineal} klms
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Fecha de carga:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {unicaSalida?.fecha_carga?.split("T")[0]}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Fecha de entrega:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {unicaSalida?.fecha_entrega?.split("T")[0]}
              </Text>
            </Text>
          </View>

          <View
            style={{
              marginTop: "20px",
            }}
          >
            <Text
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Remuneraciones/Totales/etc
            </Text>
          </View>

          <View
            style={{
              border: "1px solid #000",
              // padding: "10px 20px
              marginTop: "10px",
              borderRadius: "10px",
              flexDirection: "column",
              gap: "10px",
              padding: "15px 10px",
            }}
          >
            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Pago por espera del chofer:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {Number(unicaSalida.pago_fletero_espera).toLocaleString(
                  "es-AR",
                  {
                    style: "currency",
                    currency: "ARS",
                    minimumIntegerDigits: 2,
                  }
                )}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Refuerzo:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {Number(unicaSalida.refuerzo).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumIntegerDigits: 2,
                })}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Viaticos:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {Number(unicaSalida.viaticos).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumIntegerDigits: 2,
                })}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Total en fletes:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                }}
              >
                {Number(totalSuma).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumIntegerDigits: 2,
                })}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                textDecoration: "",
              }}
            >
              Total recaudado:{" "}
              <Text
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                  color: Number(unicaSalida.recaudacion) >= 0 ? "green" : "red",
                }}
              >
                {Number(unicaSalida.recaudacion).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumIntegerDigits: 2,
                })}
              </Text>
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
