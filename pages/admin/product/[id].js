import React, { useContext, useEffect, useReducer } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Store } from "../../../utils/Store";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { getError } from "../../../utils/error";
import Chart from '@mui/icons-material/BarChartOutlined'
import Orders from '@mui/icons-material/AssignmentOutlined'
import Products from '@mui/icons-material/Inventory2Outlined'
import { grey } from "@mui/material/colors";
import Head from "next/head";
import NextLink from "next/link";
import {
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,

  TextField,
  CircularProgress,
} from "@mui/material";
import styled from "../../../styles/layout.module.css";
import { useSnackbar } from "notistack";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpdate: "" };
    case "UPDLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpdate: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpdate: action.payload };
    default:
      return state;
  }
}

const ProductEdit = ({ params }) => {
  const productId = params.id;
  const { state } = useContext(Store);
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();
  const { userInfo } = state;

  useEffect(() => {
    if (!userInfo) {
      return router.push("/login");
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: "FETCH_REQUEST" });
          const { data } = await axios.get(`/api/admin/products/${productId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          dispatch({ type: "FETCH_SUCCESS" });
          setValue("name", data.name);
          setValue("slug", data.slug);
          setValue("price", data.price);
          setValue("image", data.image);
          setValue("category", data.category);
          setValue("brand", data.brand);
          setValue("countInStock", data.countInStock);
          setValue("description", data.description);
        } catch (err) {
          dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        }
      };
      fetchData();
    }
  }, []);

  const uploadHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post("/api/admin/upload", bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      setValue("image", data.secure_url);
      enqueueSnackbar("File uploaded succesfully", { variant: "success" });
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    image,
    brand,
    countInStock,
    description,
  }) => {
    closeSnackbar();

    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          name,
          slug,
          price,
          category,
          image,
          brand,
          countInStock,
          description,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      enqueueSnackbar("Product updated succesfully", { variant: "success" });
      router.push("/admin/products");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  return (
    <>
      <Head>
        <title>Product</title>
      </Head>

      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={styled.section}>
          <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem  button component="a">
                <Grid container direction="row" alignItems="center"><Chart sx={{color: grey[500], marginRight: '10px'}}/> Admin Dashboard</Grid> 
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem  button component="a">
                <Grid container direction="row" alignItems="center"><Orders sx={{color: grey[500], marginRight: '10px'}}/> Orders</Grid> 
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem selected button component="a">
                <Grid container direction="row" alignItems="center"><Products sx={{color: grey[500], marginRight: '10px'}}/> Products</Grid> 
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>

        <Grid item md={9} xs={12}>
          <Card className={styled.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit Product {productId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress></CircularProgress>}
                {error && (
                  <Typography className={styled.error}>{error}</Typography>
                )}
              </ListItem>

              <ListItem>
                <form
                  action=""
                  onSubmit={handleSubmit(submitHandler)}
                  className={styled.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            helperText={errors.name ? "Name is required" : ""}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="slug"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="slug"
                            label="Slug"
                            error={Boolean(errors.slug)}
                            helperText={errors.slug ? "Sluq is required" : ""}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="price"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="price"
                            label="Price"
                            error={Boolean(errors.price)}
                            helperText={errors.price ? "Price is required" : ""}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="image"
                            label="Image"
                            error={Boolean(errors.image)}
                            helperText={errors.image ? "Image is required" : ""}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Button variant="contained" component="label">
                        Upload File
                        <input type="file" onChange={uploadHandler} hidden />
                      </Button>
                      {loadingUpload && <CircularProgress />}
                    </ListItem>
                    
                    <ListItem>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="category"
                            label="Category"
                            error={Boolean(errors.category)}
                            helperText={
                              errors.category ? "Category is required" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="brand"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="brand"
                            label="Brand"
                            error={Boolean(errors.brand)}
                            helperText={errors.brand ? "Brand is required" : ""}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="countInStock"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="countInStock"
                            label="Count in stock"
                            error={Boolean(errors.countInStock)}
                            helperText={
                              errors.countInStock
                                ? "Count in stock is required"
                                : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="description"
                            label="Description"
                            error={Boolean(errors.description)}
                            helperText={
                              errors.description
                                ? "Description is required"
                                : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
                      {loadingUpdate && <CircularProgress />}
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}

export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
