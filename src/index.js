import React, { useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactTable from "react-table";
import "react-table/react-table.css";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const columns = [
  {
    Header: "Nombre",
    id: "Name",
    accessor: "Name",
  },
  {
    Header: "Headline",
    accessor: "Headline",
  },
  {
    Header: "Descripcion",
    accessor: "Description",
  },
  {
    Header: "ABV",
    accessor: "ABV",
  },
  {
    Header: "Imagen",
    accessor: "image",
  },
  {
    Header: "Marca",
    accessor: "brand",
  },
  {
    Header: "Categorias",
    accessor: "categories",
  },
];

const innerColumns = [
  {
    Header: "EAN",
    accessor: "EAN",
  },
  {
    Header: "SKU",
    accessor: "SKU",
  },
  {
    Header: "Codigo Fabrica",
    accessor: "fabrique code",
  },
  {
    Header: "Unidad",
    accessor: "unit",
  },
  {
    Header: "Cantidad",
    accessor: "measure",
  },
];

const App = () => {
  const [data, setData] = useState([
    {
      "Product ID": 1,
      Name: "Chivas Regal",
      Headline: "headline",
      Description: "trago",
      ABV: 12,
      image: "",
      brand: "Bombay",
      categories: [
        {
          id: 6,
          name: "Tequila",
        },
        {
          id: 3,
          name: "Ron",
        },
        {
          id: 1,
          name: "Vodka",
        },
      ],
      labels: [
        {
          "Product ID": 1,
          SKU: "sku",
          EAN: "EC_BDCB002",
          "fabrique code": "123AVB",
          unit: "ml",
          measure: 750,
        },
        {
          "Product ID": 1,
          SKU: "sku",
          EAN: "EC_BDCB003",
          "fabrique code": "124AVB",
          unit: "ml",
          measure: 231,
        },
      ],
    },
    {
      "Product ID": 2,
      Name: "Blue Label 2",
      Headline: "headline",
      Description: "trago",
      ABV: 14,
      image: "",
      brand: "Monkey 47",
      categories: [
        {
          id: 6,
          name: "Tequila",
        },
        {
          id: 3,
          name: "Ron",
        },
        {
          id: 1,
          name: "Vodka",
        },
      ],
      labels: [
        {
          "Product ID": 2,
          SKU: "sku",
          EAN: "EC_BDCB004",
          "fabrique code": "125AVB",
          unit: "ml",
          measure: 432,
        },
      ],
    },
    {
      "Product ID": 3,
      Name: "Rose",
      Headline: "headline",
      Description: "trago",
      ABV: 15,
      image: "",
      brand: "The Dalmore",
      categories: [
        {
          id: 6,
          name: "Tequila",
        },
        {
          id: 3,
          name: "Ron",
        },
        {
          id: 1,
          name: "Vodka",
        },
      ],
      labels: [
        {
          "Product ID": 3,
          SKU: "sku",
          EAN: "EC_BDCB005",
          "fabrique code": "125AVB",
          unit: "ml",
          measure: 543,
        },
      ],
    },
  ]);

  const [saving, setSaving] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
    const body = new FormData();
    body.append("excel", acceptedFiles[0]);

    fetch("/excel/validate/", {
      method: "POST",
      body,
    })
      .then((response) => {
        if (response.status > 299 || response.status < 200) throw new Error('status code');
        return response.json();
      })
      .then((response) => {
        if (!response.error) {
          toast.success("Excel cargado correctamente", {
            hideProgressBar: true,
          });

          setData(response.data);
        } else {
          toast.error("Ocurrió un error al cargar el excel", {
            hideProgressBar: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Ocurrió un error al cargar el excel", {
          hideProgressBar: true,
        });
      });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ onDrop });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  const normalizeData = (data) => {
    return data.map((item) => ({
      ...item,
      categories: item.categories
        .reduce((acc, label) => `${acc}${label.name}, `, "")
        .slice(0, -2),
    }));
  };

  const handleSaveData = () => {
    setSaving(true);
    fetch("/excel/save/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((response) => {
        if (response.status > 299 || response.status < 200) throw new Error('status code');
        return response.json();
      })
      .then(() => {
        toast.success("Datos almacenados correctamente", {
          hideProgressBar: true,
        });
        setSaving(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Ocurrió un error a la hora de guardar datos", {
          hideProgressBar: true,
        });
        setSaving(false);
      });
  };

  return (
    <div>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelte el archivo aqui ...</p>
        ) : (
          <p>
            Haga clic o arraste un archivo hacia aqui para llenar la tabla ...
          </p>
        )}
      </div>
      <br />
      <ReactTable
        data={normalizeData(data)}
        columns={columns}
        pageSize={10}
        className="-striped -highlight"
        SubComponent={(row) => {
          return (
            <ReactTable
              data={row.original.labels}
              columns={innerColumns}
              defaultPageSize={5}
              showPagination={false}
            />
          );
        }}
        previousText="Anterior"
        nextText="Siguiente"
        loadingText="Cargando..."
        noDataText="No se encontraron datos"
        pageText="Pagina"
        ofText="de"
        rowsText="filas"
      />
      <br />
      <div className="float-right">
        <div className="p-2 d-flex flex-row">
          {saving && (
            <div className="spinner-grow my-auto mx-3" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          )}
          <div className="my-auto">
            <button
              type="button"
              className="btn btn-success"
              disabled={data.length === 0 || saving}
              onClick={handleSaveData}
            >
              Guardar Datos
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react-wrapper"));
