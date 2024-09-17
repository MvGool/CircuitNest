import { Box, Button, FormControl, Input, Typography } from "@mui/material";
import MainPageColumn from "../components/MainPageColumn";
import { useTranslation } from "react-i18next";
import { postToApi } from "../util/apiCalls";
import { useState } from "react";

function ClassroomRegisterPage() {

    // Use translation
    const { t } = useTranslation()

    // Classroom code state
    const [classroomCode, setClassroomCode] = useState('')

    // Error state
    const [error, setError] = useState('')

    // Join classroom function
    const joinClassroom = async () => {
        // Send the classroom code to the API
        const res = await postToApi({ queryKey: `/classrooms/enroll_classroom/`, data: { classroom_code: classroomCode } })
        if (res.status === 400) {
            setError(t('classroom.does_not_exist'))
        } else {
            window.location.reload()
        }
    }    

    return (
        <MainPageColumn title={t('classroom.title')}>
            <Typography variant="body">{t('classroom.not_enrolled')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row' }} >
                <FormControl error={error !== ''}>
                    <Input placeholder={t('classroom.enter_code')} value={classroomCode} onChange={(e) => setClassroomCode(e.target.value)} />
                    <Typography variant='caption'>{error}</Typography>
                </FormControl>
                <Button variant="contained" sx={{ marginLeft: 1 }} onClick={joinClassroom}>{t('classroom.join_button')}</Button>
            </Box>
        </MainPageColumn>
    );
}

export default ClassroomRegisterPage;