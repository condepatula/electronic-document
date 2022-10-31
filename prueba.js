const persona = {
  nombre: "Juan",
  apellido: "Ramirez",
  items: [
    {
      codigoInterno: "287",
      desProductoServicio: "SOLES OBSEQUIO",
      unidadMedida: "UNI",
      cantidad: 1,
      valorItem: {
        precioUnitario: 1600000,
        totalBruto: 1600000,
        valorRestaItem: {
          totalOperacion: 1600000,
        },
      },
    },
  ],
};
console.log(persona);

persona.items[0].unidadMedida = 77;

console.log(persona);
