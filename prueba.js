const data = {
  cuotas: [{ moneda: 1 }],
};

data.cuotas.forEach((c) => {
  c.desMoneda = "Guarani";
});

console.log(data.cuotas);
