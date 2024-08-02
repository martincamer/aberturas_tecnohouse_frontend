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

export const ImprimirPdfArmadores = ({ unicaSalida }) => {
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
                textDecoration: "underline",
                fontSize: "12px",
              }}
            >
              VIATICOS ARMADORES
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

          <View
            style={{
              padding: "20px 20px",
              marginTop: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                ARMADOR:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                }}
              >
                {unicaSalida.armadores}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                CLIENTE:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                }}
              >
                {unicaSalida?.datos_cliente?.datosCliente?.map((d, index) => (
                  <React.Fragment key={index}>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "12px",
                      }}
                    >
                      <Text
                        style={{
                          textTransform: "uppercase",
                        }}
                      >
                        {d.cliente}
                      </Text>
                      <Text>({d.numeroContrato})</Text>
                    </View>
                    {index !==
                      unicaSalida.datos_cliente.datosCliente.length - 1 && (
                      <Text>, </Text>
                    )}
                  </React.Fragment>
                ))}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                LOCALIDAD:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                }}
              >
                {unicaSalida?.datos_cliente?.datosCliente?.map((d, index) => (
                  <React.Fragment key={index}>
                    <View
                      style={{
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          textTransform: "uppercase",
                        }}
                      >
                        {d.localidad}
                      </Text>
                    </View>
                    {index !==
                      unicaSalida.datos_cliente.datosCliente.length - 1 && (
                      <Text> - </Text>
                    )}
                  </React.Fragment>
                ))}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                VIATICOS:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                }}
              >
                {Number(unicaSalida.total_viaticos)?.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumIntegerDigits: 2,
                })}
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                MOTIVOS:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: `${
                    unicaSalida.motivo === "" ? "normal" : "bold"
                  }`,
                  textTransform: `${
                    unicaSalida.motivo === "" ? "capitalize" : "uppercase"
                  }`,
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                  textTransform: "uppercase",
                }}
              >
                {unicaSalida.motivo || "NO HAY MOTIVOS"}
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                SOLICITA:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                  textTransform: "uppercase",
                }}
              >
                {unicaSalida.usuario || "NO HAY NADA CARGADO"}
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "120px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                FIRMA Y ACLARACIÓN DEL ARAMADOR:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textTransform: "capitalize",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                  paddingTop: "10px",
                }}
              >
                {/* {unicaSalida.salida} */}
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "80px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                FIRMA RESPONSABLE DE CAJA:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  fontFamily: "Montserrat",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  width: "100%",
                  borderBottom: "1px dotted #000",
                  paddingTop: "10px",
                }}
              >
                {/* {unicaSalida.usuario} */}
              </Text>
            </View>

            {/* <View
              style={{
                marginTop: "30px",
              }}
            >
              <Text
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fontFamily: "Montserrat",
                }}
              >
                IMPORTANTE: LA DIFERENCIA DE KM SERA RECONOCIDA UNICAMENTE
                PRESENTANDO ESTA PLANILLA COMPLETA MAS LAS FOTOS DE VELOCIMETRO
                Y UBICACIÓN (GRUPO MARTILLOS) AL MOMENTO DE INICIO DE VIAJE Y
                REGRESO (BASE/PLATEA) SEGUN LOCALIDAD DE ARMADO.
              </Text>
            </View> */}
          </View>
        </View>
      </Page>
    </Document>
  );
};
