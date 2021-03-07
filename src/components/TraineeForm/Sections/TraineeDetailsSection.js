import { Formik } from "formik";
import * as Yup from "yup";
import { phoneRegExp } from "../../../Util/regex";
import { TextField,Icon,Grid, Button, FormControlLabel, FormLabel, InputAdornment, Radio, RadioGroup, useMediaQuery } from "@material-ui/core";
import { useTranslation } from "react-i18next";

export default function TraineeDetailsSection({ trainee,
  handleNext,
  handleCancelDialog,
  handleDetailsSectionSubmit }) {
    
  const isTabletOrMobile = useMediaQuery("(max-width: 1000px)");
  const { t } = useTranslation();

  return (
    <Formik
      //  innerRef={formRef}
      initialValues={{
        name: trainee?.name,
        phone: trainee?.phone || "",
        age: trainee?.age,
        weight: trainee?.weight,
        notes: trainee?.notes,
        profilePicture: trainee?.profilePicture,
        email: trainee?.email,
        gender: trainee?.gender,
      }}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        console.log("submit handleDetailsSectionSubmit", values);
        handleDetailsSectionSubmit(values);
        // handleDetailsUpdate(values).then((res) => {
        //   console.log("formik success");
        // }).catch((e) => {
        //   console.error("formik error",e);
        // });
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(t("TRAINEE_DETAILS_SECTION_NAME_REQUIRED")),
        phone: Yup.string().matches(phoneRegExp, {
          message: t("TRAINEE_DETAILS_SECTION_PHONE_REQUIRED"),
          excludeEmptyString: true,
        }).length(10),
        email: Yup.string()
        .email(t("TRAINEE_DETAILS_SECTION_EMAIL_REQUIRED"))
      })}
    >
      {(props) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleSubmit,
          setFieldValue,
        } = props;
        return (
          <form
            onSubmit={handleSubmit}
            style={{
              height: "100%", padding: "12px 0"
            }}
          >
            <Grid
              container
              alignItems="flex-end"
              justify="center"
              style={{ textAlign: "center", height: "100%" }}
            >

              <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "10%" }} >
                <input
                  style={{ display: "none" }}
                  type="file"
                  name="profilePicture"
                  id="profilePicture"
                  accept="image/*"
                  onChange={(event) => {
                    setFieldValue(
                      "profilePicture",
                      event.currentTarget.files[0]
                    );
                  }}
                />
                <label htmlFor="profilePicture">
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    style={values.profilePicture ? { backgroundColor: "#28a745"} : {}}
                    component="span"
                    startIcon={values.profilePicture ? <Icon className="far fa-edit" /> : <Icon className="fas fa-camera" />}
                  >
                  {values.profilePicture ? t("TRAINEE_DETAILS_SECTION_PROFILE_CHANGE") : t("TRAINEE_DETAILS_SECTION_PROFILE_UPLOAD") }
                    
                  </Button>
                </label>
              </Grid>

              
                <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "10%" }} >
              {!isTabletOrMobile && 
                values.profilePicture && (
                  <p style={{ margin: "0", padding: "0" }}>
                    {t("TRAINEE_DETAILS_SECTION_PROFILE_SELECTED")} {values.profilePicture.name}
                  </p>
                )
              }
              </Grid>
              


              <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "20%" }} >
                <TextField
                  name="name"
                  id="input-with-icon-grid"
                  label={t("TRAINEE_DETAILS_SECTION_NAME_LABEL")}
                  InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                         <Icon style={{ fontSize: "1.4em" }} className="fas fa-user-circle" />
                        </InputAdornment>
                      ),
                    }}
                  required
                  autoFocus={trainee.name ? true : false}
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={errors.name && touched.name && errors.name}
                />
              </Grid>

              <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "20%" }} >
                <TextField
                  name="phone"
                  id="input-with-icon-grid"
                  label={t("TRAINEE_DETAILS_SECTION_PHONE_LABEL")}
                  type="tel"
                  inputMode="numeric"
                  InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon style={{ fontSize: "1.4em" }} className="fas fa-phone" />
                        </InputAdornment>
                      ),
                    }}
                  autoFocus={trainee.phone ? true : false}
                  value={values.phone}
                  onChange={handleChange}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={errors.phone && touched.phone && errors.phone}
                />
              </Grid>
              

              <Grid item xs={6} lg={3} md={3} sm={6} xl={3} align="center" style={{alignSelf: "center", height:"20%"}} >
              <FormLabel
                  component="legend"
                  style={isTabletOrMobile? {} : {width:"60%",alignItems: "end", textAlign: "end"}}
                >
                  {t("TRAINEE_DETAILS_SECTION_GENDER_LABEL")}
                </FormLabel>
                </Grid>

              <Grid item xs={6} lg={3} md={3} sm={6} xl={3} align="center" 
              style={{ height: "20%" }} >

                <RadioGroup
                  name={"gender"}
                  onChange={handleChange}
                  value={values.gender}
                  style={{alignItems: "start", width: "60%"}}

                >
                  {[t("TRAINEE_DETAILS_SECTION_GENDER_OPTION_MALE"), t("TRAINEE_DETAILS_SECTION_GENDER_OPTION_FEMALE")].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>

                {touched.gender && errors.gender && <>{errors.gender}</>}
              </Grid>

              <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "20%" }} >
                <TextField
                  name="email"
                  id="input-with-icon-grid"
                  label={t("TRAINEE_DETAILS_SECTION_EMAIL_LABEL")}
                  inputMode="numeric"
                  InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon style={{ fontSize: "1.4em" }}className="far fa-envelope" />
                        </InputAdornment>
                      ),
                    }}
                  autoFocus={trainee.phone ? true : false}
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={errors.email && touched.email && errors.email}
                />
              </Grid>


              <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "15%" }} >
                <TextField
                  name="weight"
                  id="input-with-icon-grid"
                  label={t("TRAINEE_DETAILS_SECTION_WEIGHT_LABEL")}
                  type="number"
                  inputMode="numeric"
                  InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                         <Icon style={{ fontSize: "1.4em" }} className="fas fa-weight" />
                        </InputAdornment>
                      ),
                    }}
                  autoFocus={trainee.weight ? true : false}
                  value={values.weight}
                  onChange={handleChange}
                  error={touched.weight && Boolean(errors.weight)}
                  helperText={errors.weight && touched.weight && errors.weight}
                />
              </Grid>


              <Grid item xs={12} lg={6} md={6} sm={12} xl={6} align="center"
              style={{ height: "15%" }} >
                <TextField
                  name="age"
                  id="input-with-icon-grid"
                  label={t("TRAINEE_DETAILS_SECTION_AGE_LABEL")}
                  type="number"
                  inputMode="numeric"
                  InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon style={{ fontSize: "1.4em" }} className="fas fa-birthday-cake" />
                        </InputAdornment>
                      ),
                    }}
                  autoFocus={trainee.age ? true : false}
                  value={values.age}
                  onChange={handleChange}
                  error={touched.age && Boolean(errors.age)}
                  helperText={errors.age && touched.age && errors.age}
                />
              </Grid>

              <Grid item xs={12} lg={12} md={12} sm={12} xl={12} align="center"
              style={{ height: "25%" }} >
                <TextField
                  style={{ width: "80%" }}
                  id="notes"
                  name="notes"
                  label={t("TRAINEE_DETAILS_SECTION_NOTES_LABEL")}
                  multiline
                  rows={3}
                  variant="outlined"
                  autoFocus={trainee.notes ? true : false}
                  value={values.notes}
                  onChange={handleChange}
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={errors.notes && touched.notes && errors.notes}
                />
              </Grid>
              <Grid
                item
                xs={12}
                lg={12}
                md={12}
                sm={12}
                xl={12}
                align="center"
              //  style={{ display: "flex", justifyContent: "flex-end" }}
                //style={{position: "fixed", bottom: "12%", right: "10%"}}
                style={{ height: "10%", textAlign: "end"}}
              >
                <Button color="secondary" onClick={handleCancelDialog}>
                {t("CANCEL")}
                </Button>
                <Button disabled={true}>{t("BACK")}</Button>
                <Button color="primary" type="submit" onClick={handleSubmit}>
                {t("NEXT")}
                </Button>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
}
